"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { topSearches } from "@/lib/data";
import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const pathname = usePathname();
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#fffdf9]/95 text-black backdrop-blur-xl">
      <div className="border-b border-black/5 bg-[#d9482f] text-white">
        <div className="shell flex min-h-11 items-center justify-between gap-4 pb-0 text-xs text-white/90">
          <div className="hidden flex-wrap items-center gap-4 md:flex">
            <span>Loja online oficial</span>
            <span>Entrega, retirada e atendimento pelo WhatsApp</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/perfil" className="flex items-center gap-1"><Bell size={14} /> Notificacoes</Link>
            <Link href="/contato">Ajuda</Link>
            <Link href="/login" className="font-medium text-white">Entrar</Link>
          </div>
        </div>
      </div>

      <div className="shell pb-0 pt-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-bazar.png" alt="Bazar de Tudo" width={68} height={68} className="h-14 w-14 rounded-2xl border border-black/5 bg-white object-cover p-1" />
            <div>
              <p className="font-display text-3xl tracking-tight text-black">Bazar de Tudo</p>
              <p className="text-xs uppercase tracking-[0.24em] text-black/45">casa, eletros, decoracao e oportunidades</p>
            </div>
          </Link>

          <div className="flex-1">
            <div className="flex h-13 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm md:h-14">
              <input
                aria-label="Buscar produtos"
                placeholder="Buscar produtos, categorias e oportunidades"
                className="flex-1 border-0 px-5 text-sm text-black outline-none"
              />
              <button className="flex w-16 items-center justify-center bg-[#8b6743] text-white">
                <Search size={20} />
              </button>
            </div>
            <div className="mt-2 hidden flex-wrap gap-x-4 gap-y-2 text-xs text-black/55 md:flex">
              {topSearches.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Link href="/favoritos" className="rounded-2xl border border-black/10 bg-white p-3 text-black/80">
              <Heart size={20} />
            </Link>
            <Link href="/perfil" className="rounded-2xl border border-black/10 bg-white p-3 text-black/80">
              <User size={20} />
            </Link>
            <Link href="/carrinho" className="relative rounded-2xl border border-black/10 bg-white p-3 text-black">
              <ShoppingCart size={20} />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#8b6743] text-[11px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </Link>
            <button className="rounded-2xl border border-black/10 bg-white p-3 text-black md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="mt-3 hidden items-center gap-6 overflow-x-auto pb-3 text-sm font-medium text-black/72 md:flex">
          <Link href="/catalogo">Catalogo completo</Link>
          <Link href="/catalogo?filtro=ofertas">Promocoes</Link>
          <Link href="/catalogo?filtro=moveis">Moveis</Link>
          <Link href="/catalogo?filtro=eletrodomesticos">Eletrodomesticos</Link>
          <Link href="/catalogo?filtro=decoracao">Decoracao</Link>
          <Link href="/pedidos">Meus pedidos</Link>
        </nav>
      </div>
    </header>
  );
}
