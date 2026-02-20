import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

import { POST as sensorsPOST, GET as sensorsGET } from "@/app/api/devices/[deviceId]/sensors/route";
import { PATCH as sensorPATCH } from "@/app/api/sensors/[sensorId]/route";

type CreateSensorResponse = {
  sensor: {
    sensor_id: string;
    device_id: string;
    sensor_type: string;
    is_enabled: boolean;
    status: string;
  };
};

type ListSensorsResponse = {
  sensors: Array<{
    sensor_id: string;
    device_id: string;
    sensor_type: string;
    is_enabled: boolean;
    status: string;
  }>;
};

function asNextRequest(r: Request): NextRequest {
  return r as unknown as NextRequest;
}

function makeReq(method: string, body?: unknown, cookie?: string) {
  return new Request("http://localhost", {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function readJson<T>(res: Response): Promise<T> {
  const t = await res.text();
  return JSON.parse(t) as T;
}

describe("Sensors management (Task #9)", () => {
  const OWNER_ID = "00000000-0000-0000-0000-000000000002";
  const VIEWER_ID = "00000000-0000-0000-0000-000000000003";

  const ownerCookie = "auth_token=user:0002";
  const viewerCookie = "auth_token=user:0003";

  let siteId = "";
  let deviceId = "";
  let sensorId = "";

  beforeAll(async () => {
    await prisma.site.deleteMany({ where: { name: "Sensors Test Site" } });
    await prisma.siteUser.deleteMany({ where: { user_id: { in: [OWNER_ID, VIEWER_ID] } } });
    
    // Ensure users exist (idempotent)
    await prisma.user.upsert({
      where: { user_id: OWNER_ID },
      update: {
        full_name: "Owner User",
        username: "owner_user_sensors",
        email: "owner_user_sensors@example.com",
        phone: null,
        password_hash: "x",
        status: "active",
      },
      create: {
        user_id: OWNER_ID,
        full_name: "Owner User",
        username: "owner_user_sensors",
        email: "owner_user_sensors@example.com",
        phone: null,
        password_hash: "x",
        status: "active",
      },
    });

    await prisma.user.upsert({
      where: { user_id: VIEWER_ID },
      update: {
        full_name: "Viewer User",
        username: "viewer_user_sensors",
        email: "viewer_user_sensors@example.com",
        phone: null,
        password_hash: "x",
        status: "active",
      },
      create: {
        user_id: VIEWER_ID,
        full_name: "Viewer User",
        username: "viewer_user_sensors",
        email: "viewer_user_sensors@example.com",
        phone: null,
        password_hash: "x",
        status: "active",
      },
    });

    const site = await prisma.site.create({
      data: { name: "Sensors Test Site", status: "active" },
      select: { site_id: true },
    });
    siteId = site.site_id;

    // memberships
    await prisma.siteUser.create({
      data: { site_id: siteId, user_id: OWNER_ID, role: "owner" },
    });
    await prisma.siteUser.create({
      data: { site_id: siteId, user_id: VIEWER_ID, role: "viewer" },
    });

    // device under site
    const device = await prisma.device.create({
      data: {
        site_id: siteId,
        serial_number: `SN-SENS-${Date.now()}`,
        device_type: "esp32",
        secret_hash: "x",
        status: "offline",
      },
      select: { device_id: true },
    });
    deviceId = device.device_id;
  });

  afterAll(async () => {
    if (sensorId) await prisma.sensor.deleteMany({ where: { sensor_id: sensorId } });
    if (deviceId) await prisma.device.deleteMany({ where: { device_id: deviceId } });
    if (siteId) await prisma.site.deleteMany({ where: { site_id: siteId } });

    // memberships will cascade with site delete, but users are fine to keep
  });

  test("owner can add sensor to device", async () => {
    const req = makeReq(
      "POST",
      { sensor_type: "smoke", location_label: "Kitchen ceiling" },
      ownerCookie
    );

    const res = await sensorsPOST(asNextRequest(req), {
      params: Promise.resolve({ deviceId }),
    });
    expect(res.status).toBe(201);

    const body = await readJson<CreateSensorResponse>(res);
    expect(body.sensor.sensor_type).toBe("smoke");
    expect(body.sensor.status).toBe("ok");
    expect(body.sensor.is_enabled).toBe(true);

    sensorId = body.sensor.sensor_id;
  });

  test("list sensors per device (viewer can read)", async () => {
    const req = makeReq("GET", undefined, viewerCookie);
    const res = await sensorsGET(asNextRequest(req), {
      params: Promise.resolve({ deviceId }),
    });
    expect(res.status).toBe(200);

    const body = await readJson<ListSensorsResponse>(res);
    expect(body.sensors.some((s) => s.sensor_id === sensorId)).toBe(true);
  });

  test("owner can disable sensor", async () => {
    const req = makeReq("PATCH", { is_enabled: false }, ownerCookie);
    const res = await sensorPATCH(asNextRequest(req), {
      params: Promise.resolve({ sensorId }),
    });
    expect(res.status).toBe(200);

    const updated = await prisma.sensor.findUnique({
      where: { sensor_id: sensorId },
      select: { is_enabled: true },
    });
    expect(updated?.is_enabled).toBe(false);
  });

  test("owner can update sensor status", async () => {
    const req = makeReq("PATCH", { status: "faulty" }, ownerCookie);
    const res = await sensorPATCH(asNextRequest(req), {
      params: Promise.resolve({ sensorId }),
    });
    expect(res.status).toBe(200);

    const updated = await prisma.sensor.findUnique({
      where: { sensor_id: sensorId },
      select: { status: true },
    });
    expect(updated?.status).toBe("faulty");
  });

  test("viewer cannot modify sensor", async () => {
    const req = makeReq("PATCH", { status: "ok" }, viewerCookie);
    const res = await sensorPATCH(asNextRequest(req), {
      params: Promise.resolve({ sensorId }),
    });
    expect(res.status).toBe(403);
  });
});