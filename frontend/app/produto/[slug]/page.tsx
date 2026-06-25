import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

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
    <main className="shell space-y-8 py-4 md:space-y-10 md:py-8">
      <div className="hidden items-center gap-2 text-sm text-black/45 md:flex">
        <Link href="/">Home</Link>
        <ChevronRight size={16} />
        <Link href="/catalogo">Catalogo</Link>
        <ChevronRight size={16} />
        <span>{product.name}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-[#f4efe7] md:rounded-[2rem]">
          <Image src={product.image} alt={product.name} fill className="object-contain p-4 md:object-cover md:p-0" />
        </div>

        <div className="space-y-5 md:space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f3ede4] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#8d6540]">
                {product.condition}
              </span>
              {product.isOffer ? (
                <span className="rounded-full bg-[#111111] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white">
                  Oferta
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-[2rem] leading-tight text-black md:text-5xl">{product.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-black/60 md:text-base">{product.description}</p>
          </div>

          <div className="rounded-[1.75rem] bg-white p-4 shadow-card md:rounded-[2rem] md:p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[2.35rem] font-semibold leading-none text-black md:text-4xl">{money(product.price)}</p>
                {product.compareAtPrice > product.price ? (
                  <p className="mt-2 text-sm text-black/35 line-through md:text-base">{money(product.compareAtPrice)}</p>
                ) : null}
              </div>
              {product.compareAtPrice > product.price ? (
                <span className="rounded-full bg-[#111111] px-3 py-2 text-xs text-white md:px-4 md:text-sm">
                  Economia de {Math.max(0, Math.round((1 - product.price / product.compareAtPrice) * 100))}%
                </span>
              ) : null}
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-[#f8f5ef] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-black/40">Compra rapida</p>
              <p className="mt-1 text-sm leading-6 text-black/62">
                Finalize o pedido online e combine entrega ou retirada pelo WhatsApp.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
            <h2 className="text-xl font-semibold text-black">Detalhes do produto</h2>
            <p className="mt-3 text-sm leading-7 text-black/65">{product.damageNotes}</p>
          </div>

          <ProductActions product={product} />
        </div>
      </div>

      <section>
        <div className="mb-5">
          <h2 className="font-display text-2xl text-black md:text-3xl">Voce tambem pode gostar</h2>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {suggestions.map((item) => (
            <div key={item.id} className="w-[12.5rem] min-w-[12.5rem] md:w-[14rem] md:min-w-[14rem]">
              <ProductCard product={item} compact />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
