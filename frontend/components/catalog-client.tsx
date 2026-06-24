"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/lib/api";
import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function matchInitialCategory(categories: Category[], initialFilter?: string) {
  if (!initialFilter) {
    return categories[0]?.id ?? "";
  }

  const target = normalizeText(initialFilter);
  return categories.find((category) => normalizeText(category.name) === target)?.id ?? categories[0]?.id ?? "";
}

function pickSubcategoryImage(products: Product[], categoryName: string, subcategoryName?: string | null) {
  const match = products.find((product) => {
    const categoryMatch = normalizeText(product.category) === normalizeText(categoryName);
    const subcategoryMatch = subcategoryName ? normalizeText(product.subcategory ?? "") === normalizeText(subcategoryName) : true;
    return categoryMatch && subcategoryMatch;
  });

  return (
    match?.image ??
    products.find((product) => normalizeText(product.category) === normalizeText(categoryName))?.image ??
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80"
  );
}

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
  const [status, setStatus] = useState("Todos");
  const [priceRange, setPriceRange] = useState("Todos");
  const [activeCategoryId, setActiveCategoryId] = useState(matchInitialCategory(categories, initialFilter));
  const [activeSubcategoryId, setActiveSubcategoryId] = useState("all");

  useEffect(() => {
    setActiveCategoryId(matchInitialCategory(categories, initialFilter));
    setActiveSubcategoryId("all");
  }, [categories, initialFilter]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0] ?? null,
    [activeCategoryId, categories]
  );

  const activeSubcategory = useMemo(
    () => activeCategory?.subcategories?.find((subcategory) => subcategory.id === activeSubcategoryId) ?? null,
    [activeCategory, activeSubcategoryId]
  );

  const subcategoryTiles = useMemo(() => {
    if (!activeCategory) {
      return [];
    }

    return (activeCategory.subcategories ?? []).map((subcategory) => ({
      ...subcategory,
      image: subcategory.image ?? pickSubcategoryImage(products, activeCategory.name, subcategory.name),
      count: products.filter(
        (product) =>
          normalizeText(product.category) === normalizeText(activeCategory.name) &&
          normalizeText(product.subcategory ?? "") === normalizeText(subcategory.name)
      ).length
    }));
  }, [activeCategory, products]);

  const priceOptions = [
    { label: "Todos os precos", value: "Todos" },
    { label: `Ate ${money(500)}`, value: "ate-500" },
    { label: `${money(500)} a ${money(1500)}`, value: "500-1500" },
    { label: `Acima de ${money(1500)}`, value: "1500+" }
  ];
  const statusOptions = ["Todos", "Available", "Reserved", "Sold"];

  const filteredCount = useMemo(() => {
    return products.filter((product) => {
      const matchesText =
        search.length === 0 ||
        normalizeText(product.name).includes(normalizeText(search)) ||
        normalizeText(product.description).includes(normalizeText(search)) ||
        normalizeText(product.category).includes(normalizeText(search)) ||
        normalizeText(product.subcategory ?? "").includes(normalizeText(search));

      const matchesCategory = !activeCategory || normalizeText(product.category) === normalizeText(activeCategory.name);
      const matchesStatus = status === "Todos" || product.status === status.toLowerCase();
      const matchesPrice =
        priceRange === "Todos" ||
        (priceRange === "ate-500" && product.price <= 500) ||
        (priceRange === "500-1500" && product.price > 500 && product.price <= 1500) ||
        (priceRange === "1500+" && product.price > 1500);

      return matchesText && matchesCategory && matchesStatus && matchesPrice;
    }).length;
  }, [activeCategory, priceRange, products, search, status]);

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="space-y-4 lg:hidden">
        <div className="overflow-hidden rounded-[1.45rem] border border-black/6 bg-white shadow-card">
          <div className="border-b border-black/6 px-3 py-3">
            <div className="flex h-10 overflow-hidden rounded-[0.95rem] border border-black/10 bg-[#fcfbf8]">
              <div className="flex w-10 items-center justify-center text-black/45">
                <Search size={15} />
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar produtos no catalogo"
                className="flex-1 border-0 bg-transparent pr-3 text-[13px] text-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-[116px_minmax(0,1fr)]">
            <div className="border-r border-black/6 bg-[#f7f4ee]">
              {categories.map((category) => {
                const isActive = category.id === activeCategory?.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveCategoryId(category.id);
                      setActiveSubcategoryId("all");
                    }}
                    className={`relative flex min-h-[72px] w-full items-center border-b border-black/6 px-3 py-3 text-left text-[12px] leading-5 ${
                      isActive ? "bg-white font-semibold text-[#2f6ce5]" : "text-black/78"
                    }`}
                  >
                    {isActive ? <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-[#2f6ce5]" /> : null}
                    <span className="pl-2 break-words [overflow-wrap:anywhere]">{category.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-black/35">Subcategorias</p>
                  <h2 className="mt-1 truncate text-[18px] font-semibold leading-tight text-black">{activeCategory?.name ?? "Catalogo"}</h2>
                </div>
                <p className="pt-1 text-[10px] text-black/45">{filteredCount} itens</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <select
                  value={priceRange}
                  onChange={(event) => setPriceRange(event.target.value)}
                  className="h-9 min-w-0 rounded-2xl border border-black/10 bg-white px-2.5 text-[11px] text-black outline-none"
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
                  className="h-9 min-w-0 rounded-2xl border border-black/10 bg-white px-2.5 text-[11px] text-black outline-none"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>
                      {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-3">
                {subcategoryTiles.map((subcategory) => {
                  const isActive = activeSubcategoryId === subcategory.id;
                  return (
                    <Link
                      key={subcategory.id}
                      href={`/catalogo/subcategoria/${subcategory.slug}`}
                      className="min-w-0 text-center"
                    >
                      <div className={`relative mx-auto h-[3.5rem] w-[3.5rem] overflow-hidden rounded-full border ${
                        isActive ? "border-[#2f6ce5]" : "border-black/8"
                      } bg-[#f4f1ea]`}>
                        <Image src={subcategory.image} alt={subcategory.name} fill className="object-contain p-1.5" />
                      </div>
                      <p className={`mt-1.5 line-clamp-2 break-words text-[10px] font-medium leading-3 [overflow-wrap:anywhere] ${isActive ? "text-[#2f6ce5]" : "text-black"}`}>
                        {subcategory.name}
                      </p>
                    </Link>
                  );
                })}

                {subcategoryTiles.length === 0 ? (
                  <div className="col-span-3 flex min-h-[4.8rem] items-center rounded-[1rem] border border-dashed border-black/10 px-3 text-[11px] text-black/45">
                    Nenhuma subcategoria cadastrada nessa categoria.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[1.6rem] border border-black/6 bg-white shadow-card">
          <div className="border-b border-black/6 px-4 py-3 md:px-5 md:py-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-black/35 md:text-xs">Categorias</p>
            <h2 className="mt-1 text-lg font-semibold text-black md:text-2xl">Navegacao</h2>
          </div>

          <div className="bg-[#f7f4ee]">
            {categories.map((category) => {
              const isActive = category.id === activeCategory?.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(category.id);
                    setActiveSubcategoryId("all");
                  }}
                  className={`relative flex min-h-[74px] w-full items-center border-b border-black/6 px-5 text-left ${
                    isActive ? "bg-white font-semibold text-[#2f6ce5]" : "text-black/76"
                  }`}
                >
                  {isActive ? <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#2f6ce5]" /> : null}
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="rounded-[1.8rem] border border-black/6 bg-white p-5 shadow-card">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-black/35">Subcategorias</p>
                <h2 className="mt-1 text-3xl font-semibold text-black">{activeCategory?.name ?? "Catalogo"}</h2>
                <p className="mt-2 text-sm text-black/56">Escolha uma area principal e depois refine a listagem dos produtos.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
                <div className="flex h-11 overflow-hidden rounded-[1rem] border border-black/10 bg-white">
                  <div className="flex w-11 items-center justify-center text-black/45">
                    <Search size={16} />
                  </div>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar no catalogo"
                    className="flex-1 border-0 bg-transparent pr-4 text-sm text-black outline-none"
                  />
                </div>

                <select
                  value={priceRange}
                  onChange={(event) => setPriceRange(event.target.value)}
                  className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm text-black outline-none"
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
                  className="h-11 rounded-2xl border border-black/10 bg-white px-4 text-sm text-black outline-none"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>
                      {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {subcategoryTiles.map((subcategory) => {
                const isActive = activeSubcategoryId === subcategory.id;
                return (
                  <Link
                    key={subcategory.id}
                    href={`/catalogo/subcategoria/${subcategory.slug}`}
                    className={`flex items-center gap-3 rounded-[1.25rem] border p-3 text-left ${
                      isActive ? "border-[#b4885a] bg-[#faf5ee]" : "border-black/8 bg-white"
                    }`}
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-[#f4f1ea]">
                      <Image src={subcategory.image} alt={subcategory.name} fill className="object-contain p-1.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold text-black">{subcategory.name}</p>
                      <p className="text-sm text-black/45">{subcategory.count} item(ns)</p>
                    </div>
                  </Link>
                );
              })}

              {subcategoryTiles.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-[1.25rem] border border-dashed border-black/10 bg-[#fcfbf8] px-4 text-center text-sm text-black/45 sm:col-span-2 xl:col-span-4">
                  Nenhuma subcategoria cadastrada nessa categoria.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
