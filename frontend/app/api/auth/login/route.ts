import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE, ADMIN_COOKIE } from "@/lib/admin-auth";
import { getBackendApiUrl } from "@/lib/backend-url";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await fetch(`${getBackendApiUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    return NextResponse.json(
      { message: result?.detail ?? result?.message ?? "Credenciais invalidas" },
      { status: response.status || 401 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_COOKIE, result.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30
  });
  cookieStore.set(AUTH_USER_COOKIE, JSON.stringify(result.user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  cookieStore.set(ADMIN_COOKIE, result.user?.is_admin ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return NextResponse.json({ ok: true, user: result.user });
}

