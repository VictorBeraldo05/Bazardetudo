import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getBackendApiUrl } from "@/lib/backend-url";

export async function GET() {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao administrativa ausente" }, { status: 401 });
  }

  const [groupsResponse, jobsResponse, logsResponse] = await Promise.all([
    fetch(`${getBackendApiUrl()}/whatsapp/groups`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    }),
    fetch(`${getBackendApiUrl()}/whatsapp/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    }),
    fetch(`${getBackendApiUrl()}/whatsapp/logs`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    })
  ]);

  if (!groupsResponse.ok || !jobsResponse.ok || !logsResponse.ok) {
    const firstError = [groupsResponse, jobsResponse, logsResponse].find((response) => !response.ok);
    const text = firstError ? await firstError.text() : JSON.stringify({ message: "Falha ao carregar overview do WhatsApp" });
    return new NextResponse(text, {
      status: firstError?.status ?? 500,
      headers: {
        "Content-Type": firstError?.headers.get("Content-Type") ?? "application/json"
      }
    });
  }

  const [groups, jobs, logs] = await Promise.all([
    groupsResponse.json(),
    jobsResponse.json(),
    logsResponse.json()
  ]);

  return NextResponse.json({ groups, jobs, logs });
}
