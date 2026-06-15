export default function AdminFinancePage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Financeiro</p>
        <h1 className="mt-2 font-display text-4xl text-black">Receitas, saidas e margem</h1>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-card">
          <p className="text-sm text-black/45">Entradas</p>
          <p className="mt-2 text-4xl font-semibold text-black">R$ 86.420</p>
        </div>
        <div className="rounded-[1.75rem] bg-[#ede7de] p-6 shadow-card">
          <p className="text-sm text-black/45">Saidas</p>
          <p className="mt-2 text-4xl font-semibold text-black">R$ 24.100</p>
        </div>
      </div>
    </main>
  );
}

