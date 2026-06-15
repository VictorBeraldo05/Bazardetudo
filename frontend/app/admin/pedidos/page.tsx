export default function AdminOrdersPage() {
  return (
    <main className="shell py-8">
      <h1 className="font-display text-4xl">Gestao de Pedidos</h1>
      <div className="mt-6 grid gap-4">
        {["Novo", "Pago", "Separacao", "Em transporte"].map((status) => (
          <div key={status} className="rounded-[2rem] border border-black/5 bg-white/75 p-5 shadow-card">
            <p className="font-semibold">{status}</p>
            <p className="text-sm text-black/55">Fila operacional pronta para integracao com API.</p>
          </div>
        ))}
      </div>
    </main>
  );
}

