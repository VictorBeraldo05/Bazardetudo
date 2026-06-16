"use client";

import { Search, SlidersHorizontal } from "lucide-react";
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryOptions = ["Todos", "Ofertas", "Destaques", ...categories.map((item) => item.name)];
  const priceOptions = [
    { label: "Todos os precos", value: "Todos" },
    { label: `Ate ${money(500)}`, value: "ate-500" },
    { label: `${money(500)} a ${money(1500)}`, value: "500-1500" },
    { label: `Acima de ${money(1500)}`, value: "1500+" }
  ];
  const statusOptions = ["Todos", "Available", "Reserved", "Sold"];

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
      <aside className="hidden space-y-6 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card lg:block">
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
            {categoryOptions.map((item) => (
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
            {priceOptions.map((item) => (
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
            {statusOptions.map((item) => (
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
        <div className="mb-4 space-y-4 lg:hidden">
          <div className="flex h-11 overflow-hidden rounded-[1.15rem] border border-black/10 bg-white shadow-sm">
            <div className="flex w-11 items-center justify-center text-black/45">
              <Search size={17} />
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar no catalogo"
              className="flex-1 border-0 bg-transparent pr-4 text-[15px] text-black outline-none"
            />
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {categoryOptions.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                  category === item ? "bg-black text-white" : "border border-black/10 bg-white text-black"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm text-black outline-none"
            >
              {priceOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-2xl border border-black/10 bg-white px-3 text-sm text-black outline-none"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen((current) => !current)}
              className={`flex h-11 items-center justify-center rounded-2xl px-3 ${
                mobileFiltersOpen ? "bg-black text-white" : "border border-black/10 bg-white text-black"
              }`}
              aria-label="Abrir mais filtros"
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>

          {mobileFiltersOpen ? (
            <div className="grid gap-3 rounded-[1.5rem] border border-black/6 bg-white p-4 shadow-card">
              <div>
                <p className="text-sm font-semibold text-black">Categoria rapida</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryOptions.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`rounded-full px-4 py-2 text-sm ${
                        category === item ? "bg-black text-white" : "border border-black/10 bg-[#f7f5f1]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {priceOptions.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setPriceRange(item.value)}
                    className={`rounded-2xl px-4 py-3 text-left ${
                      priceRange === item.value ? "bg-black text-white" : "border border-black/10 bg-[#f7f5f1]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {statusOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={`rounded-2xl px-4 py-3 text-left ${
                      status === item ? "bg-black text-white" : "border border-black/10 bg-[#f7f5f1]"
                    }`}
                  >
                    {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-black/50">Resultados</p>
            <h2 className="text-xl font-semibold text-black md:text-2xl">{filtered.length} itens encontrados</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
