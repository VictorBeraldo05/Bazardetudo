import { CatalogClient } from "@/components/catalog-client";
import { getCategories, getProducts } from "@/lib/api";

export default async function CatalogPage({
  searchParams
}: {
  searchParams?: Promise<{ filtro?: string }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const initial = params?.filtro?.replaceAll("-", " ");

  return (
    <main className="shell py-4 md:py-8">
      <div className="mb-5 rounded-[1.6rem] bg-[#111111] px-4 py-5 text-white md:mb-8 md:rounded-[2rem] md:px-8 md:py-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 md:text-sm">Catalogo completo</p>
        <h1 className="mt-2 font-display text-2xl md:mt-3 md:text-5xl">Encontre por categoria, preco e disponibilidade.</h1>
        <p className="mt-2 max-w-2xl text-xs text-white/70 md:mt-3 md:text-base">
          Navegue mais rapido, aplique filtros e va direto aos produtos.
        </p>
      </div>
      <CatalogClient categories={categories} products={products} initialFilter={initial ? initial.charAt(0).toUpperCase() + initial.slice(1) : undefined} />
    </main>
  );
}
