import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/data";

export default function FavoritesPage() {
  return (
    <main className="shell py-8">
      <h1 className="font-display text-4xl">Favoritos</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {products.slice(0, 2).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}

