import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getBackendApiUrl } from "@/lib/backend-url";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value;
  const { id } = await params;
  const payload = await request.json();

  if (!token) {
    return NextResponse.json({ message: "Sessao administrativa ausente" }, { status: 401 });
  }

  const response = await fetch(`${getBackendApiUrl()}/categories/subcategories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json"
    }
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value;
  const { id } = await params;

  if (!token) {
    return NextResponse.json({ message: "Sessao administrativa ausente" }, { status: 401 });
  }

  const response = await fetch(`${getBackendApiUrl()}/categories/subcategories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json"
    }
  });
}
