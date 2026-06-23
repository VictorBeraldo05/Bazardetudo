import { randomUUID } from "crypto";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_TOKEN_COOKIE } from "@/lib/admin-auth";

const DEFAULT_BUCKET = "product-images";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage nao configurado no ambiente.");
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey,
    bucket
  };
}

function sanitizeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildFileName(originalName: string, slug: string | null) {
  const safeSlug = sanitizeSegment(slug || "produto") || "produto";
  const extensionMatch = originalName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);
  const extension = extensionMatch?.[1] ?? "jpg";
  return `${safeSlug}-${randomUUID()}.${extension}`;
}

export async function POST(request: Request) {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Sessao administrativa ausente" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const slug = formData.get("slug");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Arquivo da imagem nao enviado." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Envie apenas imagens validas." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: "A imagem precisa ter no maximo 5 MB." }, { status: 400 });
    }

    const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseConfig();
    const fileName = buildFileName(file.name, typeof slug === "string" ? slug : null);
    const objectPath = `products/${fileName}`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.type,
        "x-upsert": "true"
      },
      body: Buffer.from(await file.arrayBuffer()),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { message: payload?.message ?? payload?.error ?? "Falha ao enviar imagem para o storage." },
        { status: response.status }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
    return NextResponse.json({
      path: objectPath,
      publicUrl
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha inesperada ao enviar imagem." },
      { status: 500 }
    );
  }
}
