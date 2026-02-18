import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not set");
}

const JWT_SECRET = new TextEncoder().encode(secret);

export type AuthPayload = {
  user_id: string;
  username: string;
  iat?: number;
  exp?: number;
};

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null; // invalid/expired token
  }
}
