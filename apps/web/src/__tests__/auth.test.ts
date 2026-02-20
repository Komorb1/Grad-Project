import bcrypt from "bcrypt";
import { prisma} from "@/lib/prisma";
import { POST as signupPOST } from "@/app/api/auth/signup/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";

function makeJsonRequest(body: unknown) {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

describe("Auth flow", () => {
  const testUser = {
    full_name: "Test User",
    username: "testuser_auth",
    email: "testuser_auth@example.com",
    phone: "",
    password: "password123",
  };

  beforeAll(async () => {
    // Clean up in case reruns
    await prisma.user.deleteMany({
      where: { OR: [{ username: testUser.username }, { email: testUser.email }] },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { OR: [{ username: testUser.username }, { email: testUser.email }] },
    });
  });

  test("signup stores a hashed password", async () => {
    const res = await signupPOST(makeJsonRequest(testUser));
    expect(res.status).toBe(201);

    const created = await prisma.user.findUnique({
      where: { username: testUser.username },
    });

    expect(created).toBeTruthy();
    expect(created?.password_hash).toBeTruthy();
    expect(created?.password_hash).not.toBe(testUser.password);

    const ok = await bcrypt.compare(testUser.password, created!.password_hash);
    expect(ok).toBe(true);
  });

  test("login with wrong password returns 401", async () => {
    const res = await loginPOST(
      makeJsonRequest({ identifier: testUser.username, password: "wrongpass" })
    );
    expect(res.status).toBe(401);

    const body = await readJson(res);
    expect(body?.error).toBeDefined();
  });

  test("login success sets auth_token cookie", async () => {
    const res = await loginPOST(
      makeJsonRequest({ identifier: testUser.username, password: testUser.password })
    );
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("auth_token=");
    expect(setCookie).toContain("HttpOnly");
  });

  test("logout clears auth_token cookie", async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("auth_token=");
    expect(setCookie).toContain("Max-Age=0");
  });
});
