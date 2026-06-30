import { CatalogResultsClient } from "@/components/catalog-results-client";
import { getCatalogData } from "@/lib/api";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CatalogCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { categories, products } = await getCatalogData();

  const category = categories.find((item) => item.slug === slug);
  const filtered = products.filter((product) => normalizeText(product.categorySlug ?? "") === normalizeText(slug));

  return (
    <main className="shell py-4 md:py-8">
      <CatalogResultsClient
        title={category?.name ?? "Categoria"}
        subtitle="Itens agrupados por categoria para facilitar sua navegacao."
        products={filtered}
      />
    </main>
  );
}
