import { NextResponse } from "next/server";

import { getBackendApiUrl } from "@/lib/backend-url";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function forward(request: Request, { params }: RouteContext, method: string) {
  const { path } = await params;
  const apiUrl = getBackendApiUrl();
  const targetUrl = `${apiUrl}/${path.join("/")}`;

  const bodyText = method === "GET" ? undefined : await request.text();
  const response = await fetch(targetUrl, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: bodyText && bodyText.length > 0 ? bodyText : undefined,
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

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context, "POST");
}

