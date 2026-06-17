"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type InventoryProduct = {
  id: string;
  name: string;
  sku: string;
  category_name: string;
  quantity: number;
  status: string;
  sale_price: string | number;
  cost_price: string | number;
  featured: boolean;
  is_offer: boolean;
  created_at: string;
  updated_at: string;
};

type InventoryMovement = {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reason?: string | null;
  reference_id?: string | null;
  created_at: string;
  updated_at: string;
};

type InventoryOverview = {
  stats: {
    total_products: number;
    total_units: number;
    low_stock_products: number;
    out_of_stock_products: number;
    entries_count: number;
    sales_count: number;
  };
  products: InventoryProduct[];
  movements: InventoryMovement[];
};

function formatMovementLabel(type: string) {
  if (type === "entry") return "Entrada";
  if (type === "sale") return "Venda";
  return type;
}

function stockBadge(quantity: number) {
  if (quantity <= 0) return { label: "Esgotado", className: "bg-[#f7d8d2] text-[#9d3d2d]" };
  if (quantity <= 2) return { label: "Baixo", className: "bg-[#f8ecd3] text-[#8a6230]" };
  return { label: "Normal", className: "bg-[#dff2e4] text-[#2f6a43]" };
}

export function AdminInventoryManager({
  initialOverview,
  loadError
}: {
  initialOverview: InventoryOverview | null;
  loadError: string | null;
}) {
  const [overview, setOverview] = useState<InventoryOverview | null>(initialOverview);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [productId, setProductId] = useState(initialOverview?.products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(loadError);

  const filteredProducts = useMemo(() => {
    const products = overview?.products ?? [];
    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        product.category_name.toLowerCase().includes(query.toLowerCase());

      const badge = stockBadge(product.quantity).label.toLowerCase();
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "baixo" && badge === "baixo") ||
        (statusFilter === "esgotado" && badge === "esgotado") ||
        (statusFilter === "normal" && badge === "normal");

      return matchesQuery && matchesStatus;
    });
  }, [overview, query, statusFilter]);

  async function reloadOverview() {
    const response = await fetch("/api/admin/inventory", { cache: "no-store" });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result) {
      throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel atualizar o estoque.");
    }
    setOverview(result);
    if (!productId && result.products?.[0]?.id) {
      setProductId(result.products[0].id);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: Number(quantity),
          reason,
          reference_id: referenceId || undefined
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel registrar a entrada.");
      }

      await reloadOverview();
      setReason("");
      setReferenceId("");
      setQuantity("1");
      setFeedback("Entrada registrada com sucesso e estoque atualizado.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel registrar a entrada.");
    } finally {
      setLoading(false);
    }
  }

  const stats = overview?.stats;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: "Produtos cadastrados", value: stats?.total_products ?? 0, hint: "Itens ativos no sistema" },
          { label: "Unidades em estoque", value: stats?.total_units ?? 0, hint: "Soma total disponivel" },
          { label: "Estoque baixo", value: stats?.low_stock_products ?? 0, hint: "Produtos com ate 2 unidades" },
          { label: "Sem estoque", value: stats?.out_of_stock_products ?? 0, hint: "Itens zerados" },
          { label: "Entradas registradas", value: stats?.entries_count ?? 0, hint: "Historico de reposicao" },
          { label: "Saidas por venda", value: stats?.sales_count ?? 0, hint: "Baixas automaticas" }
        ].map((card) => (
          <div key={card.label} className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card">
            <p className="text-sm text-black/45">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-black">{card.value}</p>
            <p className="mt-2 text-sm text-black/55">{card.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(380px,0.86fr)_minmax(0,1.14fr)]">
        <section className="min-w-0 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Entrada manual</p>
            <h2 className="text-2xl font-semibold text-black">Registrar reposicao</h2>
            <p className="text-sm text-black/58">
              Use esta area quando mercadorias novas chegarem para um produto ja cadastrado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className="rounded-2xl border border-black/10 px-4 py-3"
            >
              {(overview?.products ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} | {product.sku} | estoque atual: {product.quantity}
                </option>
              ))}
            </select>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Quantidade recebida"
                className="rounded-2xl border border-black/10 px-4 py-3"
              />
              <input
                value={referenceId}
                onChange={(event) => setReferenceId(event.target.value)}
                placeholder="Referencia opcional (NF, lote, compra)"
                className="rounded-2xl border border-black/10 px-4 py-3"
              />
            </div>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Descreva a entrada: compra de reposicao, devolucao ao estoque, novo lote..."
              className="min-h-28 rounded-2xl border border-black/10 px-4 py-3"
            />

            <Button type="submit" disabled={loading || !productId}>
              {loading ? "Registrando..." : "Registrar entrada"}
            </Button>
            {feedback ? <p className="text-sm text-black/60">{feedback}</p> : null}
          </form>
        </section>

        <section className="min-w-0 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 max-w-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-black/45">Visao geral</p>
              <h2 className="text-2xl font-semibold leading-tight text-black">Produtos e situacao do estoque</h2>
            </div>
            <div className="min-w-0 xl:w-[420px]">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3">
                <Search size={16} className="text-black/40" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nome, SKU ou categoria"
                  className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm lg:w-[180px]"
              >
                <option value="todos">Todos</option>
                <option value="normal">Estoque normal</option>
                <option value="baixo">Estoque baixo</option>
                <option value="esgotado">Sem estoque</option>
              </select>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredProducts.map((product) => {
              const badge = stockBadge(product.quantity);
              return (
                <div key={product.id} className="rounded-[1.5rem] bg-[#f7f3ec] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-black">{product.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                        {product.is_offer ? <span className="rounded-full bg-[#eadcc9] px-3 py-1 text-xs text-black">Promocao</span> : null}
                        {product.featured ? <span className="rounded-full bg-black px-3 py-1 text-xs text-white">Destaque</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-black/55">
                        {product.category_name} | SKU {product.sku} | status {product.status}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm lg:min-w-[320px] xl:min-w-[360px]">
                      <div>
                        <p className="text-black/45">Quantidade</p>
                        <p className="mt-1 text-lg font-semibold text-black">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-black/45">Venda</p>
                        <p className="mt-1 text-lg font-semibold text-black">{money(Number(product.sale_price))}</p>
                      </div>
                      <div>
                        <p className="text-black/45">Custo</p>
                        <p className="mt-1 text-lg font-semibold text-black">{money(Number(product.cost_price))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-black/45">
                Nenhum produto encontrado com esse filtro.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Historico</p>
            <h2 className="text-2xl font-semibold text-black">Ultimas movimentacoes</h2>
          </div>
          <p className="text-sm text-black/45">{overview?.movements.length ?? 0} registros recentes</p>
        </div>

        <div className="mt-5 space-y-3">
          {(overview?.movements ?? []).map((movement) => {
            const product = overview?.products.find((item) => item.id === movement.product_id);
            const positive = movement.quantity > 0;
            return (
              <div key={movement.id} className="rounded-[1.5rem] bg-[#f7f3ec] p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${positive ? "bg-[#dff2e4] text-[#2f6a43]" : "bg-[#f7d8d2] text-[#9d3d2d]"}`}>
                        {formatMovementLabel(movement.movement_type)}
                      </span>
                      <p className="font-semibold text-black">{product?.name ?? "Produto removido"}</p>
                    </div>
                    <p className="mt-1 text-sm text-black/55">
                      {movement.reason || "Sem observacao"} {movement.reference_id ? `| ref. ${movement.reference_id}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-black/45">Quantidade</p>
                      <p className={`mt-1 text-lg font-semibold ${positive ? "text-[#2f6a43]" : "text-[#9d3d2d]"}`}>
                        {positive ? `+${movement.quantity}` : movement.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-black/45">Quando</p>
                      <p className="mt-1 font-medium text-black">
                        {new Date(movement.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {(!overview || overview.movements.length === 0) && !loadError ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-black/45">
              Ainda nao existem movimentacoes registradas no estoque.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
