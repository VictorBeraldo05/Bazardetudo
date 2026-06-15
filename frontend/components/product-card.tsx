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
    <article className="overflow-hidden rounded-[1.4rem] border border-black/5 bg-white shadow-card transition duration-200 hover:-translate-y-1">
      <div className="relative aspect-[4/4.15] overflow-hidden bg-[#f6f1e8]">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {discount > 0 ? (
            <span className="rounded-full bg-[#d9482f] px-3 py-1 text-xs font-semibold text-white">-{discount}%</span>
          ) : null}
          {product.featured ? (
            <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-black">Destaque</span>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/40">{product.category}</p>
          <Link href={`/produto/${product.slug}`} className="line-clamp-2 min-h-11 text-base font-semibold leading-tight text-black md:text-lg">
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm text-black/56">{product.description}</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xl font-bold text-[#171717]">{money(product.price)}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-black/38 line-through">{money(product.compareAtPrice)}</p>
              {discount > 0 ? <span className="text-xs font-semibold text-[#d9482f]">Economize {discount}%</span> : null}
            </div>
          </div>
          <Button
            onClick={() => addItem(product)}
            disabled={product.status !== "available"}
            className="rounded-xl bg-[#171717] px-4 py-2 text-xs text-white hover:opacity-95"
          >
            {product.status === "available" ? "Comprar" : "Indisp."}
          </Button>
        </div>
      </div>
    </article>
  );
}
