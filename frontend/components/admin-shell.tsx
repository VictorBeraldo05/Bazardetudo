"use client";

import { BarChart3, FolderTree, LogOut, Package2, Settings, ShoppingBag, Warehouse } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { NavigationLink } from "@/components/navigation-link";
import { useNavigationFeedback } from "@/components/navigation-feedback-provider";
import { useToast } from "@/components/toast-provider";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/produtos", label: "Produtos", icon: Package2 },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/estoque", label: "Estoque", icon: Warehouse },
  { href: "/admin/configuracoes", label: "Configuracoes", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const { showToast } = useToast();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    showToast({
      tone: "info",
      title: "Sessao encerrada",
      description: "Voltando para o login administrativo."
    });
    startNavigation("/admin/login");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] gap-6 p-4 lg:grid-cols-[260px_1fr] lg:p-6">
        <aside className="rounded-[2rem] bg-[#111111] p-5 text-white shadow-card">
          <div>
            <p className="font-display text-2xl">Bazar de Tudo</p>
            <p className="mt-1 text-sm text-white/55">Painel gerencial</p>
          </div>

          <nav className="mt-8 space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <NavigationLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    active ? "bg-white text-black" : "text-white/72 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </NavigationLink>
              );
            })}
          </nav>

          <button onClick={logout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/78">
            <LogOut size={16} />
            Sair
          </button>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
