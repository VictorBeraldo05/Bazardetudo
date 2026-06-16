"use client";

import Link from "next/link";
import { Heart, Home, Search, ShoppingCart, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/catalogo", label: "Catalogo", icon: Search },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { href: "/perfil", label: "Perfil", icon: User }
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#111111] px-3 pb-[calc(env(safe-area-inset-bottom)+0.3rem)] pt-2 text-white shadow-[0_-18px_50px_rgba(0,0,0,0.35)] md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-[1.1rem] px-2 py-2 text-[11px]",
                active ? "bg-white text-black" : "text-white/70"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
