import Link from "next/link";

import { dashboardStats } from "@/lib/data";

export default function AdminDashboardPage() {
  return (
    <main className="shell py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-black/45">Painel operacional</p>
          <h1 className="font-display text-4xl">Dashboard</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/admin/financeiro">Financeiro</Link>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="rounded-[2rem] border border-black/5 bg-white/75 p-5 shadow-card">
            <p className="text-sm text-black/45">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

