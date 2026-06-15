"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { Category } from "@/lib/api";
import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";

export function CatalogClient({
  categories,
  products,
  initialFilter
}: {
  categories: Category[];
  products: Product[];
  initialFilter?: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialFilter ?? "Todos");
  const [status, setStatus] = useState("Todos");
  const [priceRange, setPriceRange] = useState("Todos");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const textMatch =
        search.length === 0 ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const categoryMatch =
        category === "Todos" ||
        product.category.toLowerCase() === category.toLowerCase() ||
        (category === "Ofertas" && product.isOffer) ||
        (category === "Destaques" && product.featured);

      const statusMatch = status === "Todos" || product.status === status.toLowerCase();

      const priceMatch =
        priceRange === "Todos" ||
        (priceRange === "ate-500" && product.price <= 500) ||
        (priceRange === "500-1500" && product.price > 500 && product.price <= 1500) ||
        (priceRange === "1500+" && product.price > 1500);

      return textMatch && categoryMatch && statusMatch && priceMatch;
    });
  }, [category, priceRange, products, search, status]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div>
          <p className="text-sm font-semibold text-black">Buscar</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, categoria ou estilo"
            className="mt-3 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-black">Categoria</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Todos", "Ofertas", "Destaques", ...categories.map((item) => item.name)].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm ${category === item ? "bg-black text-white" : "border border-black/10 bg-[#f7f5f1]"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-black">Faixa de preco</p>
          <div className="mt-3 grid gap-2 text-sm">
            {[
              { label: "Todos", value: "Todos" },
              { label: `Ate ${money(500)}`, value: "ate-500" },
              { label: `${money(500)} a ${money(1500)}`, value: "500-1500" },
              { label: `Acima de ${money(1500)}`, value: "1500+" }
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setPriceRange(item.value)}
                className={`rounded-2xl px-4 py-3 text-left ${priceRange === item.value ? "bg-black text-white" : "border border-black/10 bg-[#f7f5f1]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-black">Disponibilidade</p>
          <div className="mt-3 grid gap-2 text-sm">
            {["Todos", "Available", "Reserved", "Sold"].map((item) => (
              <button
                key={item}
                onClick={() => setStatus(item)}
                className={`rounded-2xl px-4 py-3 text-left ${status === item ? "bg-black text-white" : "border border-black/10 bg-[#f7f5f1]"}`}
              >
                {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-black/50">Resultados</p>
            <h2 className="text-2xl font-semibold text-black">{filtered.length} itens encontrados</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
