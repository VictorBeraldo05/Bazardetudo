"use client";

import Link from "next/link";
import { Heart, Home, LayoutDashboard, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/catalogo", label: "Catalogo", icon: ShoppingCart },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/admin", label: "Admin", icon: LayoutDashboard }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-full border border-white/40 bg-black px-3 py-2 text-white shadow-2xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px]",
                active ? "bg-white text-black" : "text-white/75"
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

