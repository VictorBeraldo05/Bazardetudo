import { OffersShowcase } from "@/components/offers-showcase";
import { ProductCard } from "@/components/product-card";
import { getOfferProducts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const products = await getProducts();
  const offers = getOfferProducts(products).slice(0, 8);
  const latest = products.slice(0, 8);
  const spotlightProducts = offers.length > 0 ? offers : latest.slice(0, 5);

  return (
    <main className="shell space-y-5 py-2 md:space-y-8 md:py-5">
      <OffersShowcase products={spotlightProducts} />

      <section>
        <div className="mb-4 md:mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Novidades</p>
          <h2 className="mt-1 font-display text-2xl text-black md:mt-2 md:text-3xl">Catalogo em movimento</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
