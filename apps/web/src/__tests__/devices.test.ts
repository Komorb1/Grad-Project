import { prisma} from "@/lib/prisma";

import { POST as devicesPOST, GET as devicesGET } from "@/app/api/sites/[siteId]/devices/route";
import { PATCH as deviceStatusPATCH } from "@/app/api/devices/[deviceId]/status/route";

type RegisterDeviceResponse = {
  device: {
    device_id: string;
    serial_number: string;
    status: string;
  };
  device_secret: string;
};

type ListDevicesResponse = {
  devices: Array<{
    device_id: string;
    serial_number: string;
    status: string;
  }>;
};

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

describe("Devices management (Task #8)", () => {
  const MOCK_USER_ID = "00000000-0000-0000-0000-000000000002";
  const cookie = "auth_token=user:0002";

  let siteId = "";
  let deviceId = "";

    beforeAll(async () => {
        await prisma.siteUser.deleteMany({ where: { user_id: MOCK_USER_ID } });
        await prisma.user.deleteMany({ where: { user_id: MOCK_USER_ID } });

        await prisma.user.upsert({
        where: { user_id: MOCK_USER_ID },
        update: {
            full_name: "Mock User",
            username: "mock_user_devices",
            email: "mock_user_devices@example.com",
            phone: null,
            password_hash: "x",
            status: "active",
        },
        create: {
            user_id: MOCK_USER_ID,
            full_name: "Mock User",
            username: "mock_user_devices",
            email: "mock_user_devices@example.com",
            phone: null,
            password_hash: "x",
            status: "active",
        },
        });

        const site = await prisma.site.create({
            data: { name: "Device Test Site", status: "active" },
            select: { site_id: true },
        });
        siteId = site.site_id;

        await prisma.siteUser.create({
            data: {
            site_id: siteId,
            user_id: MOCK_USER_ID,
            role: "owner",
            },
        });
    });

  afterAll(async () => {
    if (deviceId) {
      await prisma.device.deleteMany({ where: { device_id: deviceId } });
    }
    if (siteId) {
      await prisma.site.deleteMany({ where: { site_id: siteId } });
    }
    await prisma.user.deleteMany({ where: { user_id: MOCK_USER_ID } });

  });

  test("register device under site (owner) returns secret once", async () => {
    const req = makeReq(
      "POST",
      { serial_number: "SN-TEST-001", device_type: "esp32" },
      cookie
    );

    const res = await devicesPOST(req as never, { params: Promise.resolve({ siteId }) });
    expect(res.status).toBe(201);

    const body = await readJson<RegisterDeviceResponse>(res);
    expect(body.device.serial_number).toBe("SN-TEST-001");
    expect(typeof body.device_secret).toBe("string");
    expect(body.device_secret.length).toBeGreaterThan(20);

    deviceId = body.device.device_id;

    const dbDevice = await prisma.device.findUnique({
      where: { device_id: deviceId },
      select: { secret_hash: true },
    });

    expect(dbDevice?.secret_hash).toBeTruthy();
    expect(dbDevice?.secret_hash).not.toBe(body.device_secret);
  });

  test("unique serial_number enforced (409)", async () => {
    const req = makeReq(
      "POST",
      { serial_number: "SN-TEST-001", device_type: "esp32" },
      cookie
    );

    const res = await devicesPOST(req as never, { params: Promise.resolve({ siteId }) });
    expect(res.status).toBe(409);
  });

  test("list devices per site (member can list)", async () => {
    const req = makeReq("GET", undefined, cookie);
    const res = await devicesGET(req as never, { params: Promise.resolve({ siteId }) });
    expect(res.status).toBe(200);

    const body = await readJson<ListDevicesResponse>(res);
    expect(Array.isArray(body.devices)).toBe(true);
    expect(body.devices.some((d) => d.device_id === deviceId)).toBe(true);
  });

  test("update device status (owner/admin only)", async () => {
    const req = makeReq("PATCH", { status: "maintenance" }, cookie);

    const res = await deviceStatusPATCH(req as never, {
      params: Promise.resolve({ deviceId }),
    });

    expect(res.status).toBe(200);

    const updated = await prisma.device.findUnique({
      where: { device_id: deviceId },
      select: { status: true },
    });

    expect(updated?.status).toBe("maintenance");
  });

  test("viewer cannot modify device", async () => {
    // downgrade role to viewer
    await prisma.siteUser.update({
      where: { site_id_user_id: { site_id: siteId, user_id: MOCK_USER_ID } },
      data: { role: "viewer" },
    });

    const req = makeReq("PATCH", { status: "online" }, cookie);
    const res = await deviceStatusPATCH(req as never, {
      params: Promise.resolve({ deviceId }),
    });

    expect(res.status).toBe(403);

    // restore owner for cleanup consistency
    await prisma.siteUser.update({
      where: { site_id_user_id: { site_id: siteId, user_id: MOCK_USER_ID } },
      data: { role: "owner" },
    });
  });
});