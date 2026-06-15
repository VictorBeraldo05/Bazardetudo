import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getCategories, getFeaturedProducts, getOfferProducts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = getFeaturedProducts(products).slice(0, 8);
  const offers = getOfferProducts(products).slice(0, 8);
  const latest = products.slice(0, 8);
  const spotlight = offers[0] ?? featured[0];

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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 md:gap-4">
          <div className="rounded-[1.35rem] border border-black/5 bg-[#fff1e8] p-3.5 shadow-card md:rounded-[1.9rem] md:p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d9482f]">Promocoes</p>
            <p className="mt-1 text-3xl font-bold text-black md:mt-2 md:text-4xl">{offers.length}</p>
            <p className="mt-1 text-sm text-black/58">Itens com desconto visivel logo de entrada.</p>
          </div>
          <div className="rounded-[1.35rem] border border-black/5 bg-white p-3.5 shadow-card md:rounded-[1.9rem] md:p-5">
            <div className="flex flex-wrap gap-2">
              <Link href="/catalogo?filtro=ofertas"><span className="inline-flex rounded-full bg-[#d9482f] px-3 py-1 text-xs font-semibold text-white">Ofertas</span></Link>
              <Link href="/catalogo"><span className="inline-flex rounded-full bg-[#f2eadf] px-3 py-1 text-xs font-semibold text-black">Catalogo</span></Link>
              <Link href="/pedidos"><span className="inline-flex rounded-full bg-[#f2eadf] px-3 py-1 text-xs font-semibold text-black">Pedidos</span></Link>
            </div>
            <p className="mt-3 text-sm text-black/58 md:mt-4">Compra mais direta, com os produtos ficando no centro da tela desde o primeiro scroll.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
        <div className="mb-4 flex items-center justify-between md:mb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Em destaque</p>
            <h2 className="mt-1 font-display text-2xl text-black md:mt-2 md:text-3xl">Produtos em destaque logo na abertura</h2>
          </div>
          <Link href="/catalogo?filtro=ofertas" className="hidden items-center gap-2 text-sm font-medium md:flex">
            Ver tudo <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {offers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-2.5 md:grid-cols-4 md:gap-3">
        {categories.slice(0, 4).map((category) => (
          <Link
            key={category.id}
            href={`/catalogo?filtro=${category.slug}`}
            className="rounded-[1.15rem] border border-black/5 bg-[#f3eadf] p-4 transition hover:bg-[#eadcc9] md:rounded-[1.4rem] md:p-5"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-[#8b6743]">Categoria</p>
            <p className="mt-2 text-lg font-semibold text-black md:mt-3 md:text-xl">{category.name}</p>
            <p className="mt-1 text-sm text-black/55">Filtros dedicados.</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between md:mb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Selecao principal</p>
            <h2 className="mt-1 font-display text-2xl text-black md:mt-2 md:text-3xl">Mais itens com prioridade na home</h2>
          </div>
          <Link href="/catalogo" className="hidden items-center gap-2 text-sm font-medium md:flex">
            Explorar catalogo <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
