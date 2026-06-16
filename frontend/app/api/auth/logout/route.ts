import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE, AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(AUTH_USER_COOKIE);
  cookieStore.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
