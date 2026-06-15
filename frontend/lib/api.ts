import { categories as fallbackCategories, products as fallbackProducts, type Product } from "@/lib/data";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  damage_notes: string;
  condition: string;
  status: "available" | "reserved" | "awaiting_payment" | "sold";
  category_id: string;
  cost_price: string;
  sale_price: string;
  compare_at_price?: string | null;
  quantity: number;
  tags?: string | null;
  featured: boolean;
  is_offer: boolean;
  images?: Array<{
    image_url: string;
    alt_text?: string | null;
    position: number;
  }>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function fallbackProductMap(): Product[] {
  return fallbackProducts;
}

export function getSessionToken() {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem("bdt-session-token");
  if (existing) {
    return existing;
  }

  const token = crypto.randomUUID();
  window.localStorage.setItem("bdt-session-token", token);
  return token;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const target = path.startsWith("/api/") ? path : `${API_URL}${path}`;
  const response = await fetch(target, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null);
      const detailValue = payload?.detail;
      const detail =
        (Array.isArray(detailValue) ? detailValue[0]?.msg : detailValue) ??
        payload?.message ??
        null;
      throw new Error(detail || "Falha na comunicacao com a API");
    }
    const errorText = await response.text();
    throw new Error(errorText || "Falha na comunicacao com a API");
  }

  return response.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await requestJson<Category[]>("/categories");
  } catch {
    return fallbackCategories.map((name, index) => ({ id: String(index), name, slug: name.toLowerCase() }));
  }
}

export function mapApiProduct(product: ApiProduct, categories: Category[]): Product {
  const category = categories.find((item) => item.id === product.category_id)?.name ?? "Catalogo";
  const primaryImage = product.images?.[0]?.image_url;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category,
    description: product.description,
    damageNotes: product.damage_notes,
    condition: product.condition,
    status: product.status,
    price: Number(product.sale_price),
    compareAtPrice: Number(product.compare_at_price ?? product.sale_price),
    tags: product.tags ? product.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
    featured: product.featured,
    isOffer: product.is_offer,
    image:
      primaryImage ??
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80"
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      requestJson<ApiProduct[]>("/products")
    ]);
    return products.map((product) => mapApiProduct(product, categories));
  } catch {
    return fallbackProductMap();
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const [categories, product] = await Promise.all([
      getCategories(),
      requestJson<ApiProduct>(`/products/slug/${slug}`)
    ]);
    return mapApiProduct(product, categories);
  } catch {
    return fallbackProductMap().find((item) => item.slug === slug) ?? null;
  }
}

export async function reserveProduct(productId: string, quantity: number) {
  return requestJson<{ cart_id: string; reserved_until: string }>("/api/store/orders/reserve", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
      session_token: getSessionToken()
    })
  });
}

export async function upsertCustomer(payload: {
  full_name: string;
  email: string;
  phone?: string;
  document?: string;
}) {
  return requestJson<{ id: string; full_name: string; email: string }>("/api/store/customers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function registerCustomer(payload: {
  full_name: string;
  email: string;
  phone: string;
  document: string;
  password: string;
}) {
  return requestJson<{ id: string; full_name: string; email: string }>("/api/store/customers/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function checkoutOrder(payload: {
  customer_id: string;
  cart_id: string;
  shipping_amount: number;
  discount_amount: number;
  notes?: string;
}) {
  return requestJson<{ id: string; order_number: string; total_amount: string }>("/api/store/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getFeaturedProducts(products: Product[]) {
  return products.filter((product) => product.featured);
}

export function getOfferProducts(products: Product[]) {
  return products.filter((product) => product.isOffer || product.tags.some((tag) => /oferta|promocao/i.test(tag)));
}
