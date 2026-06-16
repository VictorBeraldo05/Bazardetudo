import { cookies } from "next/headers";

import { AdminInventoryManager } from "@/components/admin-inventory-manager";
import { AUTH_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getBackendApiUrl } from "@/lib/backend-url";

type InventoryOverview = {
  stats: {
    total_products: number;
    total_units: number;
    low_stock_products: number;
    out_of_stock_products: number;
    entries_count: number;
    sales_count: number;
  };
  products: Array<{
    id: string;
    name: string;
    sku: string;
    category_name: string;
    quantity: number;
    status: string;
    sale_price: string;
    cost_price: string;
    featured: boolean;
    is_offer: boolean;
    created_at: string;
    updated_at: string;
  }>;
  movements: Array<{
    id: string;
    product_id: string;
    movement_type: string;
    quantity: number;
    reason?: string | null;
    reference_id?: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

export default async function AdminInventoryPage() {
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value;
  let initialOverview: InventoryOverview | null = null;
  let loadError: string | null = null;

  if (!token) {
    loadError = "Sessao administrativa ausente. Entre novamente para consultar o estoque.";
  } else {
    const response = await fetch(`${getBackendApiUrl()}/inventory/overview`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (response.ok) {
      initialOverview = (await response.json()) as InventoryOverview;
    } else {
      loadError = "Nao foi possivel carregar a visao geral do estoque no backend.";
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Estoque</p>
        <h1 className="mt-2 font-display text-4xl text-black">Visao geral e reposicao da loja</h1>
        <p className="mt-3 max-w-3xl text-sm text-black/60">
          Todo produto cadastrado entra como reposicao inicial. Toda venda gera baixa automatica. Aqui voce acompanha o estoque atual, os itens com risco de ruptura e registra novas entradas para produtos ja existentes.
        </p>
      </section>

      <AdminInventoryManager initialOverview={initialOverview} loadError={loadError} />
    </main>
  );
}
