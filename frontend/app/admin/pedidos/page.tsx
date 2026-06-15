const statuses = [
  { title: "Novos", count: 5, color: "bg-[#f0e8da]" },
  { title: "Pagos", count: 8, color: "bg-white" },
  { title: "Separacao", count: 3, color: "bg-[#ece7df]" },
  { title: "Em transporte", count: 4, color: "bg-white" }
];

export default function AdminOrdersPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Pedidos</p>
        <h1 className="mt-2 font-display text-4xl text-black">Acompanhamento operacional</h1>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((item) => (
          <div key={item.title} className={`rounded-[1.75rem] p-6 shadow-card ${item.color}`}>
            <p className="text-sm text-black/45">{item.title}</p>
            <p className="mt-2 text-4xl font-semibold text-black">{item.count}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

