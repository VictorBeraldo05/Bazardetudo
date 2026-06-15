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
    <main className="shell space-y-8 py-5">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.9rem] bg-gradient-to-br from-[#1f1b18] via-[#2b241d] to-[#6f4f35] p-6 text-white shadow-card md:p-7">
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Oferta em foco</p>
          <h1 className="mt-3 max-w-xl font-display text-3xl leading-tight md:text-4xl">
            {spotlight?.name ?? "As melhores oportunidades da vitrine"}
          </h1>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-bold">{spotlight ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(spotlight.price) : ""}</p>
            {spotlight ? <p className="text-sm text-white/55 line-through">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(spotlight.compareAtPrice)}</p> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/catalogo?filtro=ofertas"><Button className="bg-[#d9482f] text-white hover:opacity-95">Ver promocoes</Button></Link>
            <Link href="/catalogo"><Button variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white/15">Abrir catalogo</Button></Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[1.9rem] border border-black/5 bg-[#fff1e8] p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d9482f]">Promocoes</p>
            <p className="mt-2 text-4xl font-bold text-black">{offers.length}</p>
            <p className="mt-1 text-sm text-black/58">Itens com desconto visivel logo de entrada.</p>
          </div>
          <div className="rounded-[1.9rem] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex flex-wrap gap-2">
              <Link href="/catalogo?filtro=ofertas"><span className="inline-flex rounded-full bg-[#d9482f] px-3 py-1 text-xs font-semibold text-white">Ofertas</span></Link>
              <Link href="/catalogo"><span className="inline-flex rounded-full bg-[#f2eadf] px-3 py-1 text-xs font-semibold text-black">Catalogo</span></Link>
              <Link href="/pedidos"><span className="inline-flex rounded-full bg-[#f2eadf] px-3 py-1 text-xs font-semibold text-black">Pedidos</span></Link>
            </div>
            <p className="mt-4 text-sm text-black/58">Compra mais direta, com os produtos ficando no centro da tela desde o primeiro scroll.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Em destaque</p>
            <h2 className="mt-2 font-display text-3xl text-black">Produtos em destaque logo na abertura</h2>
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

      <section className="grid gap-3 md:grid-cols-4">
        {categories.slice(0, 4).map((category) => (
          <Link
            key={category.id}
            href={`/catalogo?filtro=${category.slug}`}
            className="rounded-[1.4rem] border border-black/5 bg-[#f3eadf] p-5 transition hover:bg-[#eadcc9]"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-[#8b6743]">Categoria</p>
            <p className="mt-3 text-xl font-semibold text-black">{category.name}</p>
            <p className="mt-1 text-sm text-black/55">Filtros dedicados.</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Selecao principal</p>
            <h2 className="mt-2 font-display text-3xl text-black">Mais itens com prioridade na home</h2>
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
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Novidades</p>
          <h2 className="mt-2 font-display text-3xl text-black">Catalogo em movimento</h2>
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
