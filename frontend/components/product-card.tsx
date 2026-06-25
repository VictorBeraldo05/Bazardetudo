"use client";

import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = Math.max(0, Math.round((1 - product.price / product.compareAtPrice) * 100));

  return (
    <article
      className={`overflow-hidden border border-black/5 bg-white shadow-card transition duration-200 hover:-translate-y-1 ${
        compact ? "rounded-[1rem]" : "rounded-[1.15rem] md:rounded-[1.4rem]"
      }`}
    >
      <div className={`relative overflow-hidden bg-[#f6f1e8] ${compact ? "aspect-[4/4]" : "aspect-[4/4.15]"}`}>
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        <div className={`absolute left-2 top-2 flex flex-wrap gap-1.5 ${compact ? "" : "md:left-3 md:top-3 md:gap-2"}`}>
          {discount > 0 ? (
            <span className={`rounded-full bg-[#d9482f] font-semibold text-white ${compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs"}`}>-{discount}%</span>
          ) : null}
          {product.featured ? (
            <span className={`rounded-full bg-white/92 font-semibold text-black ${compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs"}`}>Destaque</span>
          ) : null}
        </div>
      </div>
      <div className={`space-y-2 ${compact ? "p-2.5" : "p-2.5 md:space-y-3 md:p-4"}`}>
        <div className={`space-y-1 ${compact ? "" : "md:space-y-1.5"}`}>
          <p className={`uppercase text-black/40 ${compact ? "text-[8px] tracking-[0.14em]" : "text-[9px] tracking-[0.16em] md:text-xs md:tracking-[0.2em]"}`}>{product.category}</p>
          <Link
            href={`/produto/${product.slug}`}
            className={`line-clamp-2 font-semibold leading-tight text-black ${
              compact ? "min-h-9 text-[12px]" : "min-h-8 text-[13px] md:min-h-11 md:text-lg"
            }`}
          >
            {product.name}
          </Link>
          {!compact ? <p className="hidden line-clamp-2 text-sm text-black/56 md:block">{product.description}</p> : null}
        </div>
        <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-3"}`}>
          <div className="min-w-0">
            <p className={`font-bold leading-none text-[#171717] ${compact ? "text-[1.1rem]" : "text-[1.25rem] md:text-2xl"}`}>{money(product.price)}</p>
            <div className={`flex items-center gap-1.5 ${compact ? "" : "md:gap-2"}`}>
              <p className={`text-black/38 line-through ${compact ? "text-[10px]" : "text-[11px] md:text-sm"}`}>{money(product.compareAtPrice)}</p>
              {!compact && discount > 0 ? <span className="hidden text-xs font-semibold text-[#d9482f] md:inline">Economize {discount}%</span> : null}
            </div>
          </div>
          <div className={`grid grid-cols-2 gap-2 ${compact ? "" : "sm:flex sm:w-auto sm:flex-col sm:items-stretch"}`}>
            <Link href={`/produto/${product.slug}`}>
              <Button
                variant="outline"
                className={`w-full border-black/10 text-black hover:bg-black/5 ${
                  compact ? "h-8 rounded-lg px-2 text-[10px]" : "h-8 rounded-xl px-2.5 text-[10px] md:h-9 md:px-3 md:text-xs"
                }`}
              >
                Ver produto
              </Button>
            </Link>
            <Button
              onClick={() => addItem(product)}
              disabled={product.status !== "available"}
              className={`w-full bg-[#171717] text-white hover:opacity-95 ${
                compact ? "h-8 rounded-lg px-2 text-[10px]" : "h-8 rounded-xl px-2.5 text-[10px] md:h-9 md:px-4 md:py-2 md:text-xs"
              }`}
            >
              {product.status === "available" ? "Comprar" : "Indisp."}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
