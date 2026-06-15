import { dashboardStats } from "@/lib/data";

const quickCards = [
  { title: "Destaques ativos", value: "12", hint: "Produtos marcados para abrir a home" },
  { title: "Promocoes vigentes", value: "8", hint: "Itens com maior prioridade comercial" },
  { title: "Pedidos em fila", value: "14", hint: "Separacao, transporte e retirada" }
];

export default function AdminDashboardPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Painel gerencial</p>
        <h1 className="mt-3 font-display text-4xl">Operacao central da loja</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Acompanhe vendas, produtos em destaque e fluxo operacional da vitrine online.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] border border-black/5 bg-white p-5 shadow-card">
            <p className="text-sm text-black/45">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-black">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {quickCards.map((card) => (
          <div key={card.title} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-black/45">{card.title}</p>
            <p className="mt-2 text-4xl font-semibold text-black">{card.value}</p>
            <p className="mt-3 text-sm text-black/58">{card.hint}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

