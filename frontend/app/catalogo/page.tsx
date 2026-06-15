import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { getProducts } from "@/lib/api";

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <main className="shell py-8">
      <SectionTitle
        eyebrow="Catalogo"
        title="Busca, filtros e status visiveis"
        description="A interface prepara o terreno para filtros por categoria, preco e condicao conectados a API."
      />
      <div className="mb-6 flex flex-wrap gap-3">
        {["Todos", "Moveis", "Eletrodomesticos", "Decoracao", "Disponivel", "Reservado"].map((filter) => (
          <button key={filter} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm">
            {filter}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
