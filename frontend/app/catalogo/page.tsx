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
    <main className="shell py-8">
      <div className="mb-8 rounded-[2rem] bg-[#111111] px-6 py-8 text-white md:px-8">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Catalogo completo</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Encontre por categoria, faixa de preco e disponibilidade.</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Uma tela separada para compra real, com filtros claros e foco em conversao.
        </p>
      </div>
      <CatalogClient categories={categories} products={products} initialFilter={initial ? initial.charAt(0).toUpperCase() + initial.slice(1) : undefined} />
    </main>
  );
}
