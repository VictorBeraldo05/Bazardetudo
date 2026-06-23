"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { Category } from "@/lib/api";
import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";

type SubcategoryEntry = {
  id: string;
  label: string;
  image: string;
  count: number;
  matches: (product: Product) => boolean;
};

type CategoryShelf = {
  name: string;
  slug: string;
  subcategories: SubcategoryEntry[];
};

const CATEGORY_BLUEPRINTS: Record<string, Array<{ label: string; keywords: string[] }>> = {
  moveis: [
    { label: "Sofas", keywords: ["sofa", "sofá", "chaise", "retratil"] },
    { label: "Camas", keywords: ["cama", "colchao", "colchão", "box", "cabec"] },
    { label: "Mesas", keywords: ["mesa", "jantar", "escritorio", "escritório"] },
    { label: "Poltronas", keywords: ["poltrona", "cadeira", "puff"] },
    { label: "Armarios", keywords: ["armario", "armário", "guarda", "roupeiro", "closet"] },
    { label: "Aparadores", keywords: ["aparador", "buffet", "rack", "painel"] }
  ],
  eletrodomesticos: [
    { label: "Geladeiras", keywords: ["geladeira", "refrigerador", "frigobar", "freezer"] },
    { label: "Lavadoras", keywords: ["lavadora", "lava", "roupas", "tanquinho", "secadora"] },
    { label: "Fornos", keywords: ["forno", "micro", "micro-ondas", "microondas"] },
    { label: "Air Fryer", keywords: ["air fryer", "fritadeira"] },
    { label: "Fogoes", keywords: ["fogao", "fogão", "cooktop"] },
    { label: "Pequenos", keywords: ["liquidificador", "cafeteira", "batedeira", "sanduicheira"] }
  ],
  decoracao: [
    { label: "Espelhos", keywords: ["espelho"] },
    { label: "Tapetes", keywords: ["tapete", "passadeira"] },
    { label: "Iluminacao", keywords: ["luminaria", "lustre", "abajur", "led"] },
    { label: "Quadros", keywords: ["quadro", "painel decorativo"] },
    { label: "Organizacao", keywords: ["organizador", "nicho", "prateleira", "cesto"] },
    { label: "Sala", keywords: ["sala", "centro", "lateral", "decorativo"] }
  ],
  utilidades: [
    { label: "Cozinha", keywords: ["cozinha", "panela", "talher", "pote", "garrafa"] },
    { label: "Banheiro", keywords: ["banheiro", "toalha", "suporte", "saboneteira"] },
    { label: "Limpeza", keywords: ["limpeza", "vassoura", "balde", "mop"] },
    { label: "Organizadores", keywords: ["organizador", "caixa", "cesto", "gaveta"] },
    { label: "Mesa posta", keywords: ["prato", "xicara", "xícara", "jogo americano"] },
    { label: "Termicos", keywords: ["termica", "térmica", "garrafa", "copo"] }
  ],
  materiaiscolar: [
    { label: "Canetas", keywords: ["caneta", "marca texto", "marker"] },
    { label: "Cadernos", keywords: ["caderno", "agenda", "planner"] },
    { label: "Mochilas", keywords: ["mochila", "estojo", "lancheira"] },
    { label: "Desenho", keywords: ["lapis", "lápis", "giz", "pintura"] },
    { label: "Escritorio", keywords: ["grampeador", "papel", "bloco", "cola"] }
  ],
  suplementos: [
    { label: "Creatina", keywords: ["creatina"] },
    { label: "Whey", keywords: ["whey", "protein"] },
    { label: "Pre treino", keywords: ["pre treino", "pré treino"] },
    { label: "Hipercaloricos", keywords: ["hipercalorico", "hipercalórico", "mass"] },
    { label: "Vitaminas", keywords: ["vitamina", "multivitaminico"] }
  ]
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toSlug(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function titleFromProduct(product: Product) {
  const base = product.name.split(/[|,-]/)[0]?.trim() || product.name.trim();
  return base.length > 22 ? `${base.slice(0, 22).trim()}...` : base;
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function buildSubcategories(categoryName: string, products: Product[]): SubcategoryEntry[] {
  const normalizedCategory = toSlug(categoryName).replace(/-/g, "");
  const blueprints = CATEGORY_BLUEPRINTS[normalizedCategory] ?? [];
  const productMatches = products.map((product) => ({
    product,
    text: normalizeText(`${product.name} ${product.description} ${product.tags.join(" ")} ${product.category}`)
  }));

  const curated = blueprints
    .map((entry) => {
      const matches = productMatches.filter(({ text }) => entry.keywords.some((keyword) => text.includes(normalizeText(keyword))));
      if (matches.length === 0) {
        return null;
      }
      const first = matches[0]?.product;
      return {
        id: `${normalizedCategory}-${toSlug(entry.label)}`,
        label: entry.label,
        image: first?.image ?? products[0]?.image ?? "",
        count: matches.length,
        matches: (product: Product) =>
          entry.keywords.some((keyword) =>
            normalizeText(`${product.name} ${product.description} ${product.tags.join(" ")} ${product.category}`).includes(normalizeText(keyword))
          )
      } satisfies SubcategoryEntry;
    })
    .filter((item): item is SubcategoryEntry => Boolean(item));

  const fallback = products.slice(0, 8).map((product) => ({
    id: `${normalizedCategory}-${product.id}`,
    label: titleFromProduct(product),
    image: product.image,
    count: 1,
    matches: (candidate: Product) => candidate.id === product.id
  }));

  const tagged = uniqueById(
    products
      .flatMap((product) =>
        product.tags.slice(0, 2).map((tag) => ({
          id: `${normalizedCategory}-tag-${toSlug(tag)}`,
          label: tag,
          image: product.image,
          count: products.filter((item) => item.tags.some((candidateTag) => normalizeText(candidateTag) === normalizeText(tag))).length,
          matches: (candidate: Product) => candidate.tags.some((candidateTag) => normalizeText(candidateTag) === normalizeText(tag))
        }))
      )
      .filter((entry) => entry.label.length > 2)
  );

  return uniqueById([...curated, ...tagged, ...fallback]).slice(0, 12);
}

function matchInitialCategory(categories: Category[], initialFilter?: string) {
  if (!initialFilter) {
    return categories[0]?.name ?? "Todos";
  }

  const initial = normalizeText(initialFilter);
  const categoryMatch = categories.find((category) => normalizeText(category.name) === initial);
  if (categoryMatch) {
    return categoryMatch.name;
  }

  return categories[0]?.name ?? "Todos";
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
  const categoryShelves = useMemo<CategoryShelf[]>(() => {
    const realCategories = categories.length > 0 ? categories : [];
    return realCategories.map((category) => {
      const categoryProducts = products.filter((product) => normalizeText(product.category) === normalizeText(category.name));
      return {
        name: category.name,
        slug: category.slug,
        subcategories: buildSubcategories(category.name, categoryProducts)
      };
    });
  }, [categories, products]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [priceRange, setPriceRange] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState(matchInitialCategory(categories, initialFilter));
  const [activeSubcategoryId, setActiveSubcategoryId] = useState("all");

  useEffect(() => {
    setActiveCategory(matchInitialCategory(categories, initialFilter));
    setActiveSubcategoryId("all");
  }, [categories, initialFilter]);

  const activeShelf = useMemo(() => {
    return categoryShelves.find((shelf) => shelf.name === activeCategory) ?? categoryShelves[0];
  }, [activeCategory, categoryShelves]);

  const activeSubcategory = activeShelf?.subcategories.find((entry) => entry.id === activeSubcategoryId) ?? null;

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
        normalizeText(product.name).includes(normalizeText(search)) ||
        normalizeText(product.description).includes(normalizeText(search)) ||
        normalizeText(product.category).includes(normalizeText(search));

      const categoryMatch = activeCategory === "Todos" || normalizeText(product.category) === normalizeText(activeCategory);
      const subcategoryMatch = !activeSubcategory || activeSubcategory.matches(product);
      const statusMatch = status === "Todos" || product.status === status.toLowerCase();
      const priceMatch =
        priceRange === "Todos" ||
        (priceRange === "ate-500" && product.price <= 500) ||
        (priceRange === "500-1500" && product.price > 500 && product.price <= 1500) ||
        (priceRange === "1500+" && product.price > 1500);

      return textMatch && categoryMatch && subcategoryMatch && statusMatch && priceMatch;
    });
  }, [activeCategory, activeSubcategory, priceRange, products, search, status]);

  return (
    <section className="space-y-5 md:space-y-7">
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-[1.7rem] border border-black/6 bg-white shadow-card">
          <div className="grid grid-cols-[108px_minmax(0,1fr)]">
            <aside className="border-r border-black/6 bg-[#f6f3ed]">
              {categoryShelves.map((shelf) => {
                const isActive = shelf.name === activeCategory;
                return (
                  <button
                    key={shelf.name}
                    type="button"
                    onClick={() => {
                      setActiveCategory(shelf.name);
                      setActiveSubcategoryId("all");
                    }}
                    className={`relative flex min-h-20 w-full items-center border-b border-black/6 px-3 py-4 text-left text-[15px] leading-5 ${
                      isActive ? "bg-white font-semibold text-[#2a6cdf]" : "text-black/78"
                    }`}
                  >
                    {isActive ? <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#2a6cdf]" /> : null}
                    <span className="pl-2">{shelf.name}</span>
                  </button>
                );
              })}
            </aside>

            <div className="space-y-4 p-4">
              <div className="space-y-3">
                <div className="flex h-11 overflow-hidden rounded-[1rem] border border-black/10 bg-white">
                  <div className="flex w-11 items-center justify-center text-black/45">
                    <Search size={16} />
                  </div>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Buscar em ${activeShelf?.name ?? "catalogo"}`}
                    className="flex-1 border-0 bg-transparent pr-4 text-[15px] text-black outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={priceRange}
                    onChange={(event) => setPriceRange(event.target.value)}
                    className="h-10 rounded-2xl border border-black/10 bg-[#fbfaf7] px-3 text-sm text-black outline-none"
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
                    className="h-10 rounded-2xl border border-black/10 bg-[#fbfaf7] px-3 text-sm text-black outline-none"
                  >
                    {statusOptions.map((item) => (
                      <option key={item} value={item}>
                        {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-lg font-semibold text-black">{activeShelf?.name ?? "Categoria"}</p>
                <p className="mt-1 text-sm text-black/52">
                  Escolha uma area da vitrine para ir direto aos itens.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                <button
                  type="button"
                  onClick={() => setActiveSubcategoryId("all")}
                  className={`text-center ${activeSubcategoryId === "all" ? "text-[#2a6cdf]" : "text-black"}`}
                >
                  <div className={`mx-auto flex h-[4.55rem] w-[4.55rem] items-center justify-center rounded-full border ${
                    activeSubcategoryId === "all" ? "border-[#2a6cdf] bg-[#eef4ff]" : "border-black/8 bg-[#f7f5f0]"
                  }`}>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">Tudo</span>
                  </div>
                  <p className="mt-2 text-[12px] font-medium leading-4">Ver tudo</p>
                </button>

                {activeShelf?.subcategories.map((entry) => {
                  const isActive = activeSubcategoryId === entry.id;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setActiveSubcategoryId(entry.id)}
                      className={`text-center ${isActive ? "text-[#2a6cdf]" : "text-black"}`}
                    >
                      <div className={`relative mx-auto h-[4.55rem] w-[4.55rem] overflow-hidden rounded-full border ${
                        isActive ? "border-[#2a6cdf]" : "border-black/8"
                      } bg-[#f4f1ea]`}>
                        <Image src={entry.image} alt={entry.label} fill className="object-cover" />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[12px] font-medium leading-4">{entry.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[2rem] border border-black/6 bg-white shadow-card">
          <div className="border-b border-black/6 px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/38">Navegacao</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Categorias</h2>
          </div>

          <div className="bg-[#f7f3ed]">
            {categoryShelves.map((shelf) => {
              const isActive = shelf.name === activeCategory;
              return (
                <button
                  key={shelf.name}
                  type="button"
                  onClick={() => {
                    setActiveCategory(shelf.name);
                    setActiveSubcategoryId("all");
                  }}
                  className={`relative flex min-h-20 w-full items-center border-b border-black/6 px-5 text-left ${
                    isActive ? "bg-white text-black" : "text-black/70"
                  }`}
                >
                  {isActive ? <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#ba8652]" /> : null}
                  <div className="space-y-1">
                    <p className={`text-base ${isActive ? "font-semibold" : "font-medium"}`}>{shelf.name}</p>
                    <p className="text-sm text-black/45">{shelf.subcategories.length} atalhos</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-black/6 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/38">Catalogo guiado</p>
                <h2 className="mt-2 text-3xl font-semibold text-black">{activeShelf?.name ?? "Catalogo"}</h2>
                <p className="mt-2 max-w-2xl text-sm text-black/55">
                  Navegue pelas subcategorias primeiro e depois refine a listagem final dos produtos.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto_auto]">
                <div className="flex h-11 overflow-hidden rounded-[1rem] border border-black/10 bg-[#fbfaf7]">
                  <div className="flex w-11 items-center justify-center text-black/45">
                    <Search size={16} />
                  </div>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por produto, categoria ou estilo"
                    className="flex-1 border-0 bg-transparent pr-4 text-sm text-black outline-none"
                  />
                </div>

                <select
                  value={priceRange}
                  onChange={(event) => setPriceRange(event.target.value)}
                  className="h-11 rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 text-sm text-black outline-none"
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
                  className="h-11 rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 text-sm text-black outline-none"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>
                      {item === "Available" ? "Disponivel" : item === "Reserved" ? "Reservado" : item === "Sold" ? "Vendido" : item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setActiveSubcategoryId("all")}
                className={`flex items-center gap-4 rounded-[1.45rem] border p-4 text-left transition ${
                  activeSubcategoryId === "all" ? "border-[#ba8652] bg-[#fbf5ed]" : "border-black/8 bg-white"
                }`}
              >
                <div className="flex h-[4.2rem] w-[4.2rem] flex-shrink-0 items-center justify-center rounded-full bg-[#f2ece3]">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-black/62">Tudo</span>
                </div>
                <div>
                  <p className="font-semibold text-black">Visao geral</p>
                  <p className="text-sm text-black/48">Todos os itens dessa categoria</p>
                </div>
              </button>

              {activeShelf?.subcategories.map((entry) => {
                const isActive = activeSubcategoryId === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setActiveSubcategoryId(entry.id)}
                    className={`flex items-center gap-4 rounded-[1.45rem] border p-4 text-left transition ${
                      isActive ? "border-[#ba8652] bg-[#fbf5ed]" : "border-black/8 bg-white"
                    }`}
                  >
                    <div className="relative h-[4.2rem] w-[4.2rem] flex-shrink-0 overflow-hidden rounded-full bg-[#f4f1ea]">
                      <Image src={entry.image} alt={entry.label} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold text-black">{entry.label}</p>
                      <p className="mt-1 text-sm text-black/48">{entry.count} item(ns)</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.7rem] border border-black/6 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/38">Resultados</p>
            <h2 className="mt-2 text-2xl font-semibold text-black md:text-3xl">
              {activeSubcategory ? activeSubcategory.label : activeShelf?.name ?? "Catalogo"}
            </h2>
            <p className="mt-1 text-sm text-black/52">
              {filtered.length} item(ns) encontrados{activeShelf ? ` em ${activeShelf.name}` : ""}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-5 rounded-[1.35rem] border border-dashed border-black/10 bg-[#fcfaf7] px-4 py-10 text-center text-sm text-black/48">
            Nenhum produto encontrado com os filtros atuais.
          </div>
        ) : null}
      </div>
    </section>
  );
}
