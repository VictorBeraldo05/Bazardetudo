import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";

import { ProductActions } from "@/components/product-actions";
import { getProductBySlug, getProducts } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { money } from "@/lib/utils";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const suggestions = (await getProducts()).filter((item) => item.slug !== product.slug).slice(0, 4);

  return (
    <main className="shell space-y-10 py-8">
      <div className="flex items-center gap-2 text-sm text-black/45">
        <Link href="/">Home</Link>
        <ChevronRight size={16} />
        <Link href="/catalogo">Catalogo</Link>
        <ChevronRight size={16} />
        <span>{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#f4efe7]">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">{product.category}</p>
            <h1 className="font-display text-4xl text-black md:text-5xl">{product.name}</h1>
            <p className="max-w-2xl text-base text-black/60">{product.description}</p>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <p className="text-4xl font-semibold text-black">{money(product.price)}</p>
              <p className="text-base text-black/35 line-through">{money(product.compareAtPrice)}</p>
            </div>
            <span className="rounded-full bg-[#111111] px-4 py-2 text-sm text-white">
              Economia de {Math.max(0, Math.round((1 - product.price / product.compareAtPrice) * 100))}%
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-card">
              <p className="text-sm text-black/45">Estado geral</p>
              <p className="mt-2 font-semibold text-black">{product.condition}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-card">
              <p className="text-sm text-black/45">Status</p>
              <p className="mt-2 font-semibold capitalize text-black">{product.status}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-card">
              <p className="text-sm text-black/45">Categoria</p>
              <p className="mt-2 font-semibold text-black">{product.category}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-black">Sobre este item</h2>
            <p className="mt-3 text-sm leading-7 text-black/65">{product.damageNotes}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[#ede7de] p-5">
              <div className="flex items-center gap-3">
                <Truck size={18} />
                <p className="font-semibold text-black">Entrega e retirada</p>
              </div>
              <p className="mt-3 text-sm text-black/60">Escolha no checkout entre receber ou retirar na loja.</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#111111] p-5 text-white">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} />
                <p className="font-semibold">Reserva no checkout</p>
              </div>
              <p className="mt-3 text-sm text-white/72">Ao iniciar a compra, o produto fica reservado por um periodo limitado.</p>
            </div>
          </div>

          <ProductActions product={product} />
        </div>
      </div>

      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.24em] text-black/45">Voce tambem pode gostar</p>
          <h2 className="mt-2 font-display text-3xl text-black">Mais oportunidades da vitrine</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {suggestions.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
