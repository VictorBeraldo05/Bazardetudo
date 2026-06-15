import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getBackendApiUrl } from "@/lib/backend-url";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
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

  const isAdmin = Boolean(result.user?.is_admin);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, isAdmin ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  cookieStore.set(AUTH_TOKEN_COOKIE, result.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30
  });

  if (!isAdmin) {
    return NextResponse.json({ message: "Sua conta nao possui acesso administrativo.", is_admin: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true, is_admin: true });
}
