import { Search } from "lucide-react";

import { OffersShowcase } from "@/components/offers-showcase";
import { ProductCard } from "@/components/product-card";
import { getCatalogData, getOfferProducts } from "@/lib/api";

export default async function HomePage() {
  const { products } = await getCatalogData();
  const offers = getOfferProducts(products).slice(0, 8);
  const latest = products.slice(0, 8);
  const spotlightProducts = offers.length > 0 ? offers : latest.slice(0, 5);

  return (
    <main className="shell space-y-5 py-2 md:space-y-8 md:py-5">
      <OffersShowcase products={spotlightProducts} />

      <section>
        <div className="mb-4 md:mb-5">
          <h2 className="font-display text-2xl text-black md:text-3xl">Produtos em destaque</h2>
        </div>
        <div className="mb-4 md:hidden">
          <div className="flex h-11 overflow-hidden rounded-[1.15rem] border border-black/10 bg-white shadow-sm">
            <input
              aria-label="Buscar produtos"
              placeholder="Buscar produtos, categorias e oportunidades"
              className="flex-1 border-0 px-4 text-[15px] text-black outline-none"
            />
            <button className="flex w-14 items-center justify-center bg-[#8b6743] text-white">
              <Search size={17} />
            </button>
          </div>
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
