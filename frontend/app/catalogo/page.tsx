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
      <div className="mb-4 rounded-[1.3rem] border border-black/6 bg-white px-4 py-3 shadow-card md:mb-8 md:rounded-[2rem] md:px-8 md:py-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-black/36 md:text-sm">Catalogo</p>
        <h1 className="mt-1 font-display text-xl text-black md:mt-2 md:text-4xl">Categorias, subcategorias e busca rapida.</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-black/56 md:mt-2 md:text-base">
          Navegue primeiro pela estrutura da loja e depois refine os itens.
        </p>
      </div>
      <CatalogClient categories={categories} products={products} initialFilter={initial ? initial.charAt(0).toUpperCase() + initial.slice(1) : undefined} />
    </main>
  );
}
