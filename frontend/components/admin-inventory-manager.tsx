"use client";

import { Boxes, PackageCheck, PackagePlus, Search, ShoppingBag, Warehouse } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";

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
  if (quantity <= 2) return { label: "Poucas unidades", className: "bg-[#f8ecd3] text-[#8a6230]" };
  return { label: "Normal", className: "bg-[#dff2e4] text-[#2f6a43]" };
}

export function AdminInventoryManager({
  initialOverview,
  loadError
}: {
  initialOverview: InventoryOverview | null;
  loadError: string | null;
}) {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<InventoryOverview | null>(initialOverview);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [productId, setProductId] = useState(initialOverview?.products[0]?.id ?? "");
  const [entryProductQuery, setEntryProductQuery] = useState(initialOverview?.products[0]?.name ?? "");
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [costPrice, setCostPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(loadError);
  const entryPickerRef = useRef<HTMLDivElement | null>(null);

  const selectedProduct = useMemo(
    () => (overview?.products ?? []).find((product) => product.id === productId) ?? null,
    [overview, productId]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!entryPickerRef.current?.contains(event.target as Node)) {
        setEntryPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedProduct) {
      setCostPrice("");
      setSalePrice("");
      return;
    }

    setCostPrice(String(Number(selectedProduct.cost_price)));
    setSalePrice(String(Number(selectedProduct.sale_price)));
    setEntryProductQuery(selectedProduct.name);
  }, [selectedProduct]);

  const categoryOptions = useMemo(
    () => Array.from(new Set((overview?.products ?? []).map((product) => product.category_name))).sort((a, b) => a.localeCompare(b)),
    [overview]
  );

  const availableProductsCount = useMemo(
    () => (overview?.products ?? []).filter((product) => product.status === "available" && product.quantity > 0).length,
    [overview]
  );

  const soldProductsCount = useMemo(
    () => (overview?.products ?? []).filter((product) => product.status === "sold" || product.quantity <= 0).length,
    [overview]
  );

  const reservedProductsCount = useMemo(
    () => (overview?.products ?? []).filter((product) => product.status === "reserved").length,
    [overview]
  );

  const filteredProducts = useMemo(() => {
    const products = overview?.products ?? [];
    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        product.category_name.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        categoryFilter === "todas" ||
        product.category_name.toLowerCase() === categoryFilter.toLowerCase();

      const badge = stockBadge(product.quantity).label.toLowerCase();
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "available" && product.status === "available" && product.quantity > 0) ||
        (statusFilter === "reserved" && product.status === "reserved") ||
        (statusFilter === "sold" && (product.status === "sold" || product.quantity <= 0)) ||
        (statusFilter === "few" && badge === "poucas unidades");

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, overview, query, statusFilter]);

  const entryProductResults = useMemo(() => {
    const products = overview?.products ?? [];
    const normalizedQuery = entryProductQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery) ||
        product.category_name.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [entryProductQuery, overview]);

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
          reason: "Entrada manual por lote no painel",
          cost_price: costPrice.length > 0 ? Number(costPrice) : undefined,
          sale_price: salePrice.length > 0 ? Number(salePrice) : undefined
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel registrar a entrada.");
      }

      await reloadOverview();
      setQuantity("1");
      if (selectedProduct) {
        setEntryProductQuery(selectedProduct.name);
      }
      setFeedback("Entrada registrada com sucesso e estoque atualizado.");
      showToast({
        tone: "success",
        title: "Entrada registrada",
        description: selectedProduct ? selectedProduct.name : "Estoque atualizado."
      });
    } catch (error) {
      const text = error instanceof Error ? error.message : "Nao foi possivel registrar a entrada.";
      setFeedback(text);
      showToast({ tone: "error", title: "Falha ao registrar entrada", description: text });
    } finally {
      setLoading(false);
    }
  }

  const stats = overview?.stats;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Produtos cadastrados", value: stats?.total_products ?? 0, hint: "Itens no catalogo", icon: Boxes },
          { label: "Unidades na loja", value: stats?.total_units ?? 0, hint: "Volume fisico atual", icon: Warehouse },
          { label: "Produtos disponiveis", value: availableProductsCount, hint: "Prontos para venda", icon: PackageCheck },
          { label: "Produtos vendidos", value: soldProductsCount, hint: "Ja sairam da loja", icon: ShoppingBag },
          { label: "Itens reservados", value: reservedProductsCount, hint: "Separados para cliente", icon: PackageCheck },
          { label: "Entradas registradas", value: stats?.entries_count ?? 0, hint: "Historico de entradas", icon: PackagePlus }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="min-w-0 rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/45">{card.label}</p>
                <div className="rounded-2xl bg-[#f4ede1] p-2 text-[#8b6743]">
                  <Icon size={16} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold text-black">{card.value}</p>
              <p className="mt-2 text-sm text-black/55">{card.hint}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="min-w-0 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Entrada rapida</p>
            <h2 className="text-2xl font-semibold text-black">Registrar entrada</h2>
            <p className="text-sm text-black/58">
              Quando chegar mercadoria nova do lote, selecione o produto e some a quantidade recebida.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <div ref={entryPickerRef} className="relative">
              <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3">
                <Search size={16} className="text-black/40" />
                <input
                  value={entryProductQuery}
                  onFocus={() => setEntryPickerOpen(true)}
                  onChange={(event) => {
                    setEntryProductQuery(event.target.value);
                    setEntryPickerOpen(true);
                  }}
                  placeholder="Pesquisar produto por nome, SKU ou categoria"
                  className="w-full min-w-0 border-0 bg-transparent text-sm outline-none"
                />
              </div>

              {entryPickerOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[1.25rem] border border-black/10 bg-white shadow-card">
                  <div className="max-h-72 overflow-y-auto p-2">
                    {entryProductResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setProductId(product.id);
                          setEntryProductQuery(product.name);
                          setEntryPickerOpen(false);
                        }}
                        className={`flex w-full flex-col items-start rounded-[1rem] px-3 py-3 text-left transition ${
                          product.id === productId ? "bg-[#f6f1e8]" : "hover:bg-[#faf7f1]"
                        }`}
                      >
                        <span className="font-medium text-black">{product.name}</span>
                        <span className="mt-1 text-xs text-black/55">
                          {product.category_name} | SKU {product.sku} | estoque atual: {product.quantity}
                        </span>
                      </button>
                    ))}

                    {entryProductResults.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-black/45">Nenhum produto encontrado para essa busca.</div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {selectedProduct ? (
              <div className="rounded-[1.5rem] bg-[#f6f1e8] p-4">
                <p className="font-semibold text-black">{selectedProduct.name}</p>
                <p className="mt-1 text-sm text-black/55">
                  {selectedProduct.category_name} | SKU {selectedProduct.sku}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stockBadge(selectedProduct.quantity).className}`}>
                    {stockBadge(selectedProduct.quantity).label}
                  </span>
                  <span className="text-sm text-black/55">estoque atual: {selectedProduct.quantity}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-black/45">Custo atual</p>
                    <p className="mt-1 font-semibold text-black">{money(Number(selectedProduct.cost_price))}</p>
                  </div>
                  <div>
                    <p className="text-black/45">Venda atual</p>
                    <p className="mt-1 font-semibold text-black">{money(Number(selectedProduct.sale_price))}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Quantidade recebida"
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(event) => setCostPrice(event.target.value)}
                placeholder="Custo do lote"
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={salePrice}
                onChange={(event) => setSalePrice(event.target.value)}
                placeholder="Preco de venda"
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[1, 5, 10, 20].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(String(preset))}
                  className="rounded-full border border-black/10 bg-[#f7f3ec] px-4 py-2 text-sm text-black transition hover:bg-[#efe4d4]"
                >
                  +{preset}
                </button>
              ))}
            </div>

            <Button type="submit" disabled={loading || !productId} className="h-12 text-base">
              {loading ? "Registrando..." : "Registrar entrada"}
            </Button>
            {feedback ? <p className="text-sm text-black/60">{feedback}</p> : null}
          </form>
        </section>

        <section className="min-w-0 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm uppercase tracking-[0.24em] text-black/45">Visao geral</p>
              <h2 className="text-2xl font-semibold leading-tight text-black">Produtos e situacao do estoque</h2>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row xl:w-[620px]">
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
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm lg:w-[200px]"
              >
                <option value="todas">Todas as categorias</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-black/10 px-4 py-3 text-sm lg:w-[180px]"
              >
                <option value="todos">Todos</option>
                <option value="available">Disponiveis</option>
                <option value="reserved">Reservados</option>
                <option value="sold">Vendidos</option>
                <option value="few">Poucas unidades</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredProducts.map((product) => {
              const badge = stockBadge(product.quantity);
              const percentage = Math.min(100, Math.max(8, product.quantity * 10));
              return (
                <div key={product.id} className="rounded-[1.5rem] bg-[#f7f3ec] p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-black">{product.name}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                        {product.is_offer ? <span className="rounded-full bg-[#eadcc9] px-3 py-1 text-xs text-black">Promocao</span> : null}
                        {product.featured ? <span className="rounded-full bg-black px-3 py-1 text-xs text-white">Destaque</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-black/55">
                        {product.category_name} | SKU {product.sku} | status {product.status}
                      </p>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white">
                        <div
                          className={`h-full rounded-full ${product.quantity <= 0 ? "bg-[#c94b33]" : product.quantity <= 2 ? "bg-[#d6a14d]" : "bg-[#2f6a43]"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-[110px_110px_120px]">
                      <div>
                        <p className="text-sm text-black/45">Quantidade</p>
                        <p className="mt-1 text-xl font-semibold text-black">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-black/45">Status</p>
                        <p className="mt-1 text-base font-semibold text-black capitalize">
                          {product.status === "available" ? "Disponivel" : product.status === "reserved" ? "Reservado" : product.status === "sold" ? "Vendido" : product.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProductId(product.id);
                          setEntryProductQuery(product.name);
                          setEntryPickerOpen(false);
                          setQuantity("1");
                        }}
                        className="rounded-2xl bg-[#111111] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95"
                      >
                        Repor
                      </button>
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
                      {movement.reason || "Sem observacao"}
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
