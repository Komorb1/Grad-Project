import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    // Clear bad/expired cookie and redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);

    const res = NextResponse.redirect(url);
    res.cookies.set("auth_token", "", { path: "/", maxAge: 0 });
    return res;
  }

  // Token is valid
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
