"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingBag } from "lucide-react";

import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between pb-0">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-bazar.png" alt="Bazar de Tudo" width={60} height={60} className="h-12 w-12 rounded-2xl object-cover" />
          <div>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-black/55">Bazar de Tudo</p>
            <p className="text-xs text-black/45">catalogo premium com lote unico</p>
          </div>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/catalogo">Catalogo</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-full border border-black/10 bg-white/70 p-3"><Search size={18} /></button>
          <Link href="/carrinho" className="relative rounded-full border border-black/10 bg-white/70 p-3">
            <ShoppingBag size={18} />
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {count}
              </span>
            ) : null}
          </Link>
          <button className="rounded-full border border-black/10 bg-white/70 p-3 md:hidden"><Menu size={18} /></button>
        </div>
      </div>
    </header>
  );
}

