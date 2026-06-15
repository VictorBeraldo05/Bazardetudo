export default function AdminFinancePage() {
  return (
    <main className="shell py-8">
      <h1 className="font-display text-4xl">Financeiro</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
          <p className="text-sm text-black/45">Entradas</p>
          <p className="mt-2 text-3xl font-semibold">R$ 86.420</p>
        </div>
        <div className="rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
          <p className="text-sm text-black/45">Saidas</p>
          <p className="mt-2 text-3xl font-semibold">R$ 24.100</p>
        </div>
      </div>
    </main>
  );
}

