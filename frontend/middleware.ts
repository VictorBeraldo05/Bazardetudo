import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login") || pathname.startsWith("/admin/sem-acesso")) {
    return NextResponse.next();
  }

  const adminState = request.cookies.get(ADMIN_COOKIE)?.value;
  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  if (adminState === "1" && authToken) {
    return NextResponse.next();
  }

  if (adminState === "0") {
    return NextResponse.redirect(new URL("/admin/sem-acesso", request.url));
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"]
};
