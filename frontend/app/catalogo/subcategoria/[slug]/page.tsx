import { CatalogResultsClient } from "@/components/catalog-results-client";
import { getCategories, getProducts } from "@/lib/api";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CatalogSubcategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const match = categories
    .flatMap((category) => (category.subcategories ?? []).map((subcategory) => ({ category, subcategory })))
    .find(({ subcategory }) => subcategory.slug === slug);

  const filtered = products.filter((product) => normalizeText(product.subcategorySlug ?? "") === normalizeText(slug));

  return (
    <main className="shell py-4 md:py-8">
      <CatalogResultsClient
        title={match?.subcategory.name ?? "Subcategoria"}
        subtitle={`Produtos filtrados em ${match?.category.name ?? "uma selecao da loja"}.`}
        products={filtered}
      />
    </main>
  );
}
