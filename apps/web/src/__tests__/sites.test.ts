import { prisma} from "@/lib/prisma";

import { POST as sitesPOST, GET as sitesGET } from "@/app/api/sites/route";
import { PATCH as statusPATCH } from "@/app/api/sites/[siteId]/status/route";
import { DELETE as siteDELETE } from "@/app/api/sites/[siteId]/route";
import type { NextRequest } from "next/server";

function asNextRequest(r: Request): NextRequest {
  return r as unknown as NextRequest;
}
type SitesResponse = {
  sites: {
    site_id: string;
    name: string;
    status: string;
  }[];
};

type CreateSiteResponse = {
  site: {
    site_id: string;
  };
};

function makeJsonRequest(body: unknown, cookie?: string) {
  return new Request("http://localhost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(cookie?: string) {
  return new Request("http://localhost", {
    method: "GET",
    headers: cookie ? { cookie } : {},
  });
}

async function readJson<T>(res: Response): Promise<T> {
  const t = await res.text();
  return JSON.parse(t) as T;
}

describe("Sites RBAC", () => {
  const user = {
    full_name: "Site Owner",
    username: "siteowner_test",
    email: "siteowner_test@example.com",
    phone: "",
    password: "password123",
  };

  let cookie = "auth_token=user:0001";
  let siteId = "";
  const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

beforeAll(async () => {
  await prisma.siteUser.deleteMany({ where: { user_id: MOCK_USER_ID } });
  await prisma.user.deleteMany({ where: { user_id: MOCK_USER_ID } });

  await prisma.user.upsert({
    where: { user_id: MOCK_USER_ID },
    update: {
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: null,
      password_hash: "x",
      status: "active",
    },
    create: {
      user_id: MOCK_USER_ID,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: null,
      password_hash: "x",
      status: "active",
    },
  });

  // any cookie value is fine because jwtVerify is mocked
  cookie = "auth_token=fake";
});

  afterAll(async () => {
    if (siteId) await prisma.site.deleteMany({ where: { site_id: siteId } });
    await prisma.user.deleteMany({ where: { user_id: MOCK_USER_ID } });
  });

  test("create site creates SiteUser owner", async () => {
    const res = await sitesPOST(
      makeJsonRequest(
        { name: "Test Site", city: "Istanbul", country: "TR" },
        cookie
      )
    );
    expect(res.status).toBe(201);

    const body = await readJson<CreateSiteResponse>(res);
    siteId = body.site.site_id;

    const membership = await prisma.siteUser.findUnique({
      where: {
        site_id_user_id: {
          site_id: siteId,
          user_id: MOCK_USER_ID,
        },
      },
      select: { role: true },
    });

    expect(membership?.role).toBe("owner");
  });

  test("list sites returns sites user has access to", async () => {
    const res = await sitesGET(makeGetRequest(cookie));
    expect(res.status).toBe(200);

    const body = await readJson<SitesResponse>(res);
    expect(Array.isArray(body.sites)).toBe(true);
    expect(body.sites.some((s) => s.site_id === siteId)).toBe(true);
  });

  test("update status allowed for owner", async () => {
    const req = new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "inactive" }),
    });

    const res = await statusPATCH(asNextRequest(req), { params: Promise.resolve({ siteId }) });

    expect(res.status).toBe(200);

    const updated = await prisma.site.findUnique({
      where: { site_id: siteId },
      select: { status: true },
    });

    expect(updated?.status).toBe("inactive");
  });

  test("delete site allowed for owner", async () => {
    const req = new Request("http://localhost", { method: "DELETE", headers: { cookie } });
    const res = await siteDELETE(asNextRequest(req), { params: Promise.resolve({ siteId }) });
    expect(res.status).toBe(200);

    const deleted = await prisma.site.findUnique({ where: { site_id: siteId } });
    expect(deleted).toBeNull();
  });
});