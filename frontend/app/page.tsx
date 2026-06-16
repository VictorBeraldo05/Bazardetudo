import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getOfferProducts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const products = await getProducts();
  const offers = getOfferProducts(products).slice(0, 8);
  const latest = products.slice(0, 8);
  const spotlight = offers[0] ?? latest[0];

  return (
    <main className="shell space-y-5 py-2 md:space-y-8 md:py-5">
      <section className="grid gap-2.5 lg:grid-cols-[1.15fr_0.85fr] md:gap-4">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-[#1f1b18] via-[#2b241d] to-[#6f4f35] p-4 text-white shadow-card md:rounded-[1.9rem] md:p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Oferta em foco</p>
          <h1 className="mt-2 max-w-xl font-display text-[1.85rem] leading-tight md:mt-3 md:text-4xl">
            {spotlight?.name ?? "As melhores oportunidades da vitrine"}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-end gap-x-3 gap-y-1 md:mt-4">
            <p className="text-[2.1rem] font-bold leading-none md:text-3xl">{spotlight ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(spotlight.price) : ""}</p>
            {spotlight ? <p className="text-sm text-white/55 line-through">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(spotlight.compareAtPrice)}</p> : null}
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2 md:mt-5 md:gap-3">
            <Link href="/catalogo?filtro=ofertas"><Button className="bg-[#d9482f] px-4 py-2.5 text-white hover:opacity-95 md:px-5 md:py-3">Ver promocoes</Button></Link>
            <Link href="/catalogo"><Button variant="outline" className="border-white/15 bg-white/10 px-4 py-2.5 text-white hover:bg-white/15 md:px-5 md:py-3">Abrir catalogo</Button></Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 md:mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Novidades</p>
          <h2 className="mt-1 font-display text-2xl text-black md:mt-2 md:text-3xl">Catalogo em movimento</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
