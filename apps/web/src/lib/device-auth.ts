import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type DevicePayload = {
  device_id: string;
  site_id: string;
  typ?: string;
};

export async function requireDevice(req: NextRequest): Promise<DevicePayload> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) throw new Error("device_unauthenticated");

  const secret = process.env.DEVICE_JWT_SECRET ?? process.env.JWT_SECRET;
  if (!secret) throw new Error("server_misconfigured");

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  const p = payload as unknown as DevicePayload;

  if (!p.device_id || !p.site_id || p.typ !== "device") {
    throw new Error("device_unauthenticated");
  }

  return p;
}