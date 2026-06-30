import { CatalogClient } from "@/components/catalog-client";
import { getCatalogData } from "@/lib/api";

export default async function CatalogPage({
  searchParams
}: {
  searchParams?: Promise<{ filtro?: string }>;
}) {
  const params = await searchParams;
  const { categories, products } = await getCatalogData();
  const initial = params?.filtro?.replaceAll("-", " ");

  return (
    <main className="shell py-4 md:py-8">
      <CatalogClient categories={categories} products={products} initialFilter={initial ? initial.charAt(0).toUpperCase() + initial.slice(1) : undefined} />
    </main>
  );
}
