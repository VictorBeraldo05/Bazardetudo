export default function OrdersPage() {
  return (
    <main className="shell py-8">
      <h1 className="font-display text-4xl">Pedidos</h1>
      <div className="mt-6 grid gap-4">
        {["BDT-7A23AA11", "BDT-9C55EF10"].map((order) => (
          <div key={order} className="rounded-[2rem] border border-black/5 bg-white/75 p-5 shadow-card">
            <p className="font-semibold">{order}</p>
            <p className="text-sm text-black/55">Status: Em transporte</p>
          </div>
        ))}
      </div>
    </main>
  );
}

