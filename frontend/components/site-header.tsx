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
        <div className="shell flex min-h-8 items-center justify-between gap-3 pb-0 text-[11px] text-white/90 md:min-h-8 md:text-[11px]">
          <div className="hidden flex-wrap items-center gap-4 md:flex">
            <span>Loja online oficial</span>
            <span>Entrega, retirada e atendimento pelo WhatsApp</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/perfil" className="flex items-center gap-1 md:hidden"><Bell size={13} /></Link>
            <Link href="/perfil" className="hidden items-center gap-1 md:flex"><Bell size={14} /> Notificacoes</Link>
            <Link href="/contato" className="hidden md:block">Ajuda</Link>
            <Link href="/login" className="font-medium text-white">Entrar</Link>
          </div>
        </div>
      </div>

      <div className="shell pb-0 pt-2 md:pt-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-bazar.png" alt="Bazar de Tudo" width={68} height={68} className="h-12 w-12 rounded-[1.15rem] border border-black/5 bg-white object-cover p-1 md:h-14 md:w-14 md:rounded-2xl" />
            <div>
              <p className="font-display text-[1.9rem] leading-none tracking-tight text-black md:text-3xl">Bazar de Tudo</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-black/45 md:text-xs md:tracking-[0.24em]">casa, eletros, decoracao e oportunidades</p>
            </div>
          </Link>

          <div className="w-full flex-1">
            <div className="flex h-10 overflow-hidden rounded-[1.1rem] border border-black/10 bg-white shadow-sm md:h-14 md:rounded-2xl">
              <input
                aria-label="Buscar produtos"
                placeholder="Buscar produtos, categorias e oportunidades"
                className="flex-1 border-0 px-4 text-[15px] text-black outline-none md:px-5 md:text-sm"
              />
              <button className="flex w-14 items-center justify-center bg-[#8b6743] text-white md:w-16">
                <Search size={17} />
              </button>
            </div>
            <div className="mt-2 hidden flex-wrap gap-x-4 gap-y-2 text-xs text-black/55 md:flex">
              {topSearches.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>

          <div className="grid w-full grid-cols-4 gap-2 md:flex md:w-auto md:items-center">
            <Link href="/favoritos" className="flex items-center justify-center rounded-[1rem] border border-black/10 bg-white p-2 text-black/80 md:rounded-2xl md:p-3">
              <Heart size={18} />
            </Link>
            <Link href="/perfil" className="flex items-center justify-center rounded-[1rem] border border-black/10 bg-white p-2 text-black/80 md:rounded-2xl md:p-3">
              <User size={18} />
            </Link>
            <Link href="/carrinho" className="relative flex items-center justify-center rounded-[1rem] border border-black/10 bg-white p-2 text-black md:rounded-2xl md:p-3">
              <ShoppingCart size={18} />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b6743] text-[10px] font-semibold text-white md:-right-2 md:-top-2 md:h-6 md:w-6 md:text-[11px]">
                  {count}
                </span>
              ) : null}
            </Link>
            <button className="flex items-center justify-center rounded-[1rem] border border-black/10 bg-white p-2 text-black md:hidden">
              <Menu size={18} />
            </button>
          </div>
        </div>

        <nav className="mt-2 hidden items-center gap-6 overflow-x-auto pb-2 text-sm font-medium text-black/72 md:flex">
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
