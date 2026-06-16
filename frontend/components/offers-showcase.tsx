"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function OffersShowcase({ products }: { products: Product[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-[#17120f] via-[#2b2118] to-[#8b5e35] text-white shadow-card md:rounded-[2rem]">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {products.map((product) => (
          <article key={product.id} className="grid min-w-full gap-4 p-4 md:p-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="order-2 flex min-w-0 flex-col justify-center lg:order-1">
              <p className="text-xs uppercase tracking-[0.32em] text-white/68">OFERTAS</p>
              <h1 className="mt-3 max-w-xl font-display text-[1.95rem] leading-tight text-white md:text-4xl lg:text-[3.2rem]">
                {product.name}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/74 md:text-base">
                {product.description}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1 md:mt-5">
                <p className="text-[2.2rem] font-bold leading-none md:text-[2.75rem]">{money(product.price)}</p>
                <p className="text-base text-white/45 line-through">{money(product.compareAtPrice)}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5 md:mt-6">
                <Link href={`/produto/${product.slug}`}>
                  <Button className="bg-[#d9482f] px-5 py-3 text-white hover:opacity-95">Ver oferta</Button>
                </Link>
                <Link href="/catalogo?filtro=ofertas">
                  <Button variant="outline" className="border-white/15 bg-white/10 px-5 py-3 text-white hover:bg-white/15">
                    Ver promocoes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[1/1] overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/8 shadow-2xl md:aspect-[1.05/0.9] md:rounded-[1.8rem]">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-transparent to-transparent" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {products.length > 1 ? (
        <div className="flex items-center gap-2 px-4 pb-4 md:px-7 md:pb-6">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ir para oferta ${index + 1}`}
              className={index === activeIndex ? "h-2.5 w-8 rounded-full bg-white" : "h-2.5 w-2.5 rounded-full bg-white/35"}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
