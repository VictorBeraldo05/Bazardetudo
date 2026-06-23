"use client";

import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = Math.max(0, Math.round((1 - product.price / product.compareAtPrice) * 100));

  return (
    <article className="overflow-hidden rounded-[1.15rem] border border-black/5 bg-white shadow-card transition duration-200 hover:-translate-y-1 md:rounded-[1.4rem]">
      <div className="relative aspect-[4/4.15] overflow-hidden bg-[#f6f1e8]">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 md:left-3 md:top-3 md:gap-2">
          {discount > 0 ? (
            <span className="rounded-full bg-[#d9482f] px-2 py-0.5 text-[10px] font-semibold text-white md:px-3 md:py-1 md:text-xs">-{discount}%</span>
          ) : null}
          {product.featured ? (
            <span className="rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-black md:px-3 md:py-1 md:text-xs">Destaque</span>
          ) : null}
        </div>
      </div>
      <div className="space-y-2 p-2.5 md:space-y-3 md:p-4">
        <div className="space-y-1 md:space-y-1.5">
          <p className="text-[9px] uppercase tracking-[0.16em] text-black/40 md:text-xs md:tracking-[0.2em]">{product.category}</p>
          <Link href={`/produto/${product.slug}`} className="line-clamp-2 min-h-8 text-[13px] font-semibold leading-tight text-black md:min-h-11 md:text-lg">
            {product.name}
          </Link>
          <p className="hidden line-clamp-2 text-sm text-black/56 md:block">{product.description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-3">
          <div className="min-w-0">
            <p className="text-[1.25rem] font-bold leading-none text-[#171717] md:text-2xl">{money(product.price)}</p>
            <div className="flex items-center gap-1.5 md:gap-2">
              <p className="text-[11px] text-black/38 line-through md:text-sm">{money(product.compareAtPrice)}</p>
              {discount > 0 ? <span className="hidden text-xs font-semibold text-[#d9482f] md:inline">Economize {discount}%</span> : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-col sm:items-stretch">
            <Link href={`/produto/${product.slug}`}>
              <Button variant="outline" className="h-8 w-full rounded-xl border-black/10 px-2.5 text-[10px] text-black hover:bg-black/5 md:h-9 md:px-3 md:text-xs">
                Ver produto
              </Button>
            </Link>
            <Button
              onClick={() => addItem(product)}
              disabled={product.status !== "available"}
              className="h-8 w-full rounded-xl bg-[#171717] px-2.5 text-[10px] text-white hover:opacity-95 md:h-9 md:px-4 md:py-2 md:text-xs"
            >
              {product.status === "available" ? "Comprar" : "Indisp."}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
