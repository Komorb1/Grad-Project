import { verifyAuthToken } from "@/lib/jwt";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (k === name) return rest.join("=") || "";
  }
  return null;
}

export async function requireUserId(req: Request): Promise<string> {
  const cookieHeader = req.headers.get("cookie");
  const token = getCookieValue(cookieHeader, "auth_token");

  if (!token) {
    throw new Error("unauthenticated");
  }

  const payload = await verifyAuthToken(token);
  if (!payload?.user_id) {
    throw new Error("unauthenticated");
  }

  return payload.user_id;
}