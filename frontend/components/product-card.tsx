"use client";

import Image from "next/image";
import Link from "next/link";

import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/75 shadow-card backdrop-blur">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-black">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">{product.category}</p>
          <Link href={`/produto/${product.slug}`} className="block text-xl font-semibold text-black">
            {product.name}
          </Link>
          <p className="text-sm text-black/60">{product.description}</p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold">{money(product.price)}</p>
            <p className="text-sm text-black/40 line-through">{money(product.compareAtPrice)}</p>
          </div>
          <Button onClick={() => addItem(product)} disabled={product.status !== "available"}>
            {product.status === "available" ? "Adicionar" : "Indisponivel"}
          </Button>
        </div>
      </div>
    </article>
  );
}
