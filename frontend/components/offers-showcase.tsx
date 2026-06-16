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
          <article key={product.id} className="grid min-w-full grid-cols-[130px_1fr] items-center gap-3 p-3 sm:grid-cols-[160px_1fr] sm:gap-4 sm:p-4 md:p-7 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6 lg:items-center">
            <div className="order-2 flex min-w-0 flex-col justify-center lg:order-1">
              <p className="text-xs uppercase tracking-[0.32em] text-white/68">OFERTAS</p>
              <h1 className="mt-2 max-w-xl font-display text-[1.55rem] leading-tight text-white sm:text-[1.8rem] md:mt-3 md:text-4xl lg:text-[3.2rem]">
                {product.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1 md:mt-5 md:gap-x-3">
                <p className="text-[1.9rem] font-bold leading-none sm:text-[2.1rem] md:text-[2.75rem]">{money(product.price)}</p>
                <p className="text-sm text-white/45 line-through md:text-base">{money(product.compareAtPrice)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 md:mt-6 md:gap-2.5">
                <Link href={`/produto/${product.slug}`}>
                  <Button className="h-10 bg-[#d9482f] px-4 text-sm text-white hover:opacity-95 md:h-auto md:px-5 md:py-3">Ver oferta</Button>
                </Link>
                <Link href="/catalogo?filtro=ofertas" className="hidden sm:block">
                  <Button variant="outline" className="h-10 border-white/15 bg-white/10 px-4 text-sm text-white hover:bg-white/15 md:h-auto md:px-5 md:py-3">
                    Ver promocoes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[0.92/1] overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/8 shadow-2xl sm:aspect-[1/1] md:aspect-[1.05/0.9] md:rounded-[1.8rem]">
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
