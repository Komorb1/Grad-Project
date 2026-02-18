export const runtime = "nodejs";

export async function POST() {
  const res = Response.json({ message: "Logged out" });

  // Clear cookie by expiring it immediately
  res.headers.append(
    "Set-Cookie",
    `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );

  return res;
}
