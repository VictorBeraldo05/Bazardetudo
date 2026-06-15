import Link from "next/link";
import { ChevronRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getCategories, getFeaturedProducts, getOfferProducts, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = getFeaturedProducts(products).slice(0, 4);
  const offers = getOfferProducts(products).slice(0, 8);
  const latest = products.slice(0, 8);

  return (
    <main className="shell space-y-12 py-8">
      <section className="grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="overflow-hidden rounded-[2rem] bg-[#111111] p-8 text-white shadow-card md:p-10">
          <div className="flex max-w-3xl flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/75">
              <Sparkles size={14} /> destaque da semana
            </span>
            <div className="space-y-3">
              <h1 className="font-display text-4xl leading-tight md:text-6xl">
                Oportunidades para casa, rotina e lazer em um layout de compra simples.
              </h1>
              <p className="max-w-2xl text-base text-white/70 md:text-lg">
                Comece pelos promocionais, navegue pelo catalogo completo e finalize seu pedido com carrinho, checkout e acompanhamento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo?filtro=ofertas"><Button>Ver promocoes</Button></Link>
              <Link href="/catalogo"><Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">Abrir catalogo completo</Button></Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            <p className="text-sm text-black/45">Ofertas em destaque</p>
            <p className="mt-2 text-4xl font-semibold text-black">{offers.length}</p>
            <p className="mt-2 text-sm text-black/55">Selecao especial logo na abertura para facilitar conversao.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] bg-[#ede7de] p-6">
              <div className="flex items-center gap-3">
                <Truck size={18} />
                <p className="font-semibold">Entrega e retirada</p>
              </div>
              <p className="mt-3 text-sm text-black/60">Fluxo pronto para retirada agendada ou envio local.</p>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-card">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} />
                <p className="font-semibold">Checkout com reserva</p>
              </div>
              <p className="mt-3 text-sm text-black/60">Os itens entram em reserva temporaria durante a finalizacao da compra.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Descobertas do dia</p>
            <h2 className="mt-2 font-display text-3xl text-black">Promocoes que merecem abrir a vitrine</h2>
          </div>
          <Link href="/catalogo?filtro=ofertas" className="hidden items-center gap-2 text-sm font-medium md:flex">
            Ver tudo <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {offers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {categories.slice(0, 4).map((category) => (
          <Link
            key={category.id}
            href={`/catalogo?filtro=${category.slug}`}
            className="rounded-[1.75rem] border border-black/5 bg-[#f1ede6] p-6 transition hover:bg-[#e9e3d7]"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Categoria</p>
            <p className="mt-4 text-2xl font-semibold text-black">{category.name}</p>
            <p className="mt-2 text-sm text-black/55">Colecao com navegação rapida e filtros dedicados.</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Destaques</p>
            <h2 className="mt-2 font-display text-3xl text-black">Selecao principal da semana</h2>
          </div>
          <Link href="/catalogo" className="hidden items-center gap-2 text-sm font-medium md:flex">
            Explorar catalogo <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Catalogo em movimento</p>
          <h2 className="mt-2 font-display text-3xl text-black">Novidades e itens recem-publicados</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
