import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { POST as deviceAuthPOST } from "@/app/api/devices/auth/route";

function asNextRequest(r: Request): NextRequest {
  return r as unknown as NextRequest;
}

function makeReq(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

async function readJson<T>(res: Response): Promise<T> {
  const t = await res.text();
  return JSON.parse(t) as T;
}

describe("Device authentication (Task #10)", () => {
  let siteId = "";
  let deviceId = "";

  afterEach(async () => {
    if (deviceId) await prisma.device.deleteMany({ where: { device_id: deviceId } });
    if (siteId) await prisma.site.deleteMany({ where: { site_id: siteId } });
    deviceId = "";
    siteId = "";
  });

  test("valid serial + secret returns device_token", async () => {
    const secret = "super-secret-device-key";
    const serial = `SN-AUTH-${Date.now()}`;

    const site = await prisma.site.create({
      data: { name: "Auth Test Site", status: "active" },
      select: { site_id: true },
    });
    siteId = site.site_id;

    const secret_hash = await bcrypt.hash(secret, 12);

    const device = await prisma.device.create({
      data: {
        site_id: siteId,
        serial_number: serial,
        device_type: "esp32",
        secret_hash,
        status: "offline",
      },
      select: { device_id: true },
    });
    deviceId = device.device_id;

    const res = await deviceAuthPOST(
      asNextRequest(makeReq({ serial_number: serial, secret }))
    );

    expect(res.status).toBe(200);

    const body = await readJson<{ device_token: string; expires_in_seconds: number }>(res);
    expect(typeof body.device_token).toBe("string");
    expect(body.device_token.length).toBeGreaterThan(10);
    expect(body.expires_in_seconds).toBe(15 * 60);

    const updated = await prisma.device.findUnique({
      where: { device_id: deviceId },
      select: { status: true, last_seen_at: true },
    });
    expect(updated?.status).toBe("online");
    expect(updated?.last_seen_at).toBeTruthy();
  });

  test("unknown serial is rejected (401)", async () => {
    const res = await deviceAuthPOST(
      asNextRequest(makeReq({ serial_number: "SN-DOES-NOT-EXIST", secret: "whatever-secret-123" }))
    );
    expect(res.status).toBe(401);
  });

  test("wrong secret is rejected (401)", async () => {
    const secret = "correct-secret-123456";
    const serial = `SN-AUTH-${Date.now()}`;

    const site = await prisma.site.create({
      data: { name: "Auth Test Site", status: "active" },
      select: { site_id: true },
    });
    siteId = site.site_id;

    const secret_hash = await bcrypt.hash(secret, 12);

    const device = await prisma.device.create({
      data: {
        site_id: siteId,
        serial_number: serial,
        device_type: "esp32",
        secret_hash,
        status: "offline",
      },
      select: { device_id: true },
    });
    deviceId = device.device_id;

    const res = await deviceAuthPOST(
      asNextRequest(makeReq({ serial_number: serial, secret: "wrong-secret-123456" }))
    );
    expect(res.status).toBe(401);
  });

  test("rate limiting blocks repeated attempts (429)", async () => {
    const secret = "rate-limit-secret-123456";
    const serial = `SN-RL-${Date.now()}`;

    const site = await prisma.site.create({
      data: { name: "Rate Limit Site", status: "active" },
      select: { site_id: true },
    });
    siteId = site.site_id;

    const secret_hash = await bcrypt.hash(secret, 12);

    const device = await prisma.device.create({
      data: {
        site_id: siteId,
        serial_number: serial,
        device_type: "esp32",
        secret_hash,
        status: "offline",
      },
      select: { device_id: true },
    });
    deviceId = device.device_id;

    const ip = "9.9.9.9";

    // 10 attempts allowed per minute, 11th should be 429
    for (let i = 0; i < 10; i++) {
      const res = await deviceAuthPOST(
        asNextRequest(makeReq({ serial_number: serial, secret: "wrong-secret" }, ip))
      );
      expect([401, 429]).toContain(res.status);
    }

    const res11 = await deviceAuthPOST(
      asNextRequest(makeReq({ serial_number: serial, secret: "wrong-secret" }, ip))
    );
    expect(res11.status).toBe(429);
  });
});