"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CatalogResultsClient({
  title,
  subtitle,
  products
}: {
  title: string;
  subtitle: string;
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [priceRange, setPriceRange] = useState("Todos");

  const priceOptions = [
    { label: "Todos os precos", value: "Todos" },
    { label: `Ate ${money(500)}`, value: "ate-500" },
    { label: `${money(500)} a ${money(1500)}`, value: "500-1500" },
    { label: `Acima de ${money(1500)}`, value: "1500+" }
  ];
  const statusOptions = ["Todos", "Available", "Reserved", "Sold"];

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesText =
        search.length === 0 ||
        normalizeText(product.name).includes(normalizeText(search)) ||
        normalizeText(product.description).includes(normalizeText(search)) ||
        normalizeText(product.category).includes(normalizeText(search)) ||
        normalizeText(product.subcategory ?? "").includes(normalizeText(search));

      const matchesStatus = status === "Todos" || product.status === status.toLowerCase();
      const matchesPrice =
        priceRange === "Todos" ||
        (priceRange === "ate-500" && product.price <= 500) ||
        (priceRange === "500-1500" && product.price > 500 && product.price <= 1500) ||
        (priceRange === "1500+" && product.price > 1500);

      return matchesText && matchesStatus && matchesPrice;
    });
  }, [priceRange, products, search, status]);

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="rounded-[1.5rem] border border-black/6 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-black/35 md:text-xs">Catalogo</p>
            <h1 className="mt-1 text-2xl font-semibold text-black md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-black/55">{subtitle}</p>
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
            <div className="flex h-10 overflow-hidden rounded-[1rem] border border-black/10 bg-[#fcfbf8] md:h-11">
              <div className="flex w-10 items-center justify-center text-black/45 md:w-11">
                <Search size={15} />
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar nesta selecao"
                className="flex-1 border-0 bg-transparent pr-3 text-[13px] text-black outline-none md:pr-4 md:text-sm"
              />
            </div>

            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black outline-none md:h-11 md:px-4 md:text-sm"
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
              className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-[12px] text-black outline-none md:h-11 md:px-4 md:text-sm"
            >
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-[1.55rem] border border-black/6 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-black/35 md:text-xs">Resultados</p>
          <h2 className="mt-1 text-xl font-semibold text-black md:text-3xl">{filtered.length} itens encontrados</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-[1.2rem] border border-dashed border-black/10 bg-[#fcfaf7] px-4 py-8 text-center text-sm text-black/48">
            Nenhum produto encontrado com os filtros atuais.
          </div>
        ) : null}
      </div>
    </section>
  );
}
