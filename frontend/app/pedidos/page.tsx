import { Truck } from "lucide-react";

export default async function OrdersPage({
  searchParams
}: {
  searchParams?: Promise<{ sucesso?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="shell space-y-6 py-8">
      <section className="rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Pedidos</p>
        <h1 className="mt-3 font-display text-4xl">Acompanhe seus pedidos e entregas.</h1>
        {params?.sucesso ? <p className="mt-3 text-sm text-white/72">Pedido confirmado: {params.sucesso}</p> : null}
      </section>

      <div className="grid gap-4">
        {["BDT-10496404", "BDT-9C55EF10"].map((order) => (
          <div key={order} className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-black">{order}</p>
                <p className="mt-1 text-sm text-black/55">Pagamento confirmado e acompanhamento ativo.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ede7de] px-4 py-2 text-sm text-black">
                <Truck size={16} /> Em transporte
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

