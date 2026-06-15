import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <main className="shell space-y-14 py-8 md:py-12">
      <section className="overflow-hidden rounded-[2.5rem] border border-black/5 bg-grain p-8 shadow-card md:p-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-white">
              <Sparkles size={14} /> curadoria premium de lote unico
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">
                Produtos com pequenas avarias, experiencia grande.
              </h1>
              <p className="max-w-2xl text-base text-black/60 md:text-lg">
                Uma operacao elegante para descobrir moveis, eletros e decoracao com alta economia e total controle de estoque.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo"><Button>Ver catalogo completo</Button></Link>
              <Link href="/contato"><Button variant="outline">Falar no WhatsApp</Button></Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] bg-white/75 p-6">
            <div className="flex items-center justify-between rounded-[1.5rem] border border-black/5 bg-white p-4">
              <div>
                <p className="text-sm text-black/45">Reservas ativas</p>
                <p className="text-3xl font-semibold">15 min</p>
              </div>
              <ArrowRight />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[1.5rem] bg-black p-4 text-white">
                <p className="text-sm text-white/70">Novos lotes</p>
                <p className="mt-2 text-2xl font-semibold">32</p>
              </div>
              <div className="rounded-[1.5rem] border border-black/5 bg-white p-4">
                <p className="text-sm text-black/45">Economia media</p>
                <p className="mt-2 text-2xl font-semibold">38%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="Categorias"
          title="Explore por ambiente e necessidade"
          description="A navegacao foi pensada para toque rapido e fotos em destaque absoluto, como em apps premium."
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-[1.75rem] border border-black/5 bg-white/75 p-5 text-center shadow-card">
              <p className="font-medium">{category.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="Destaques da semana"
          title="Recem-chegados e ofertas"
          description="Curadoria com foco em itens de giro rapido, oportunidade e ultima unidade."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
