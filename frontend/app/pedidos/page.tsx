import { CircleCheckBig, Clock3, PackageCheck, ReceiptText, Truck } from "lucide-react";

const orders = [
  {
    id: "BDT-10496404",
    status: "Em transporte",
    statusTone: "shipping",
    date: "30/06/2026",
    total: "R$ 1.389,90",
    items: "2 itens",
    message: "Seu pedido ja saiu para entrega e esta em deslocamento."
  },
  {
    id: "BDT-9C55EF10",
    status: "Separacao",
    statusTone: "preparing",
    date: "29/06/2026",
    total: "R$ 349,00",
    items: "1 item",
    message: "Estamos separando os produtos para envio ou retirada."
  }
];

function getStatusStyles(tone: string) {
  if (tone === "shipping") {
    return {
      badge: "bg-[#e8f0ff] text-[#2856a6]",
      icon: <Truck size={16} />
    };
  }

  if (tone === "preparing") {
    return {
      badge: "bg-[#f8ecd3] text-[#8a6230]",
      icon: <PackageCheck size={16} />
    };
  }

  return {
    badge: "bg-[#dff2e4] text-[#2f6a43]",
    icon: <CircleCheckBig size={16} />
  };
}

export default async function OrdersPage({
  searchParams
}: {
  searchParams?: Promise<{ sucesso?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="shell pb-8 pt-4 md:pt-8">
      <div className="space-y-5 md:space-y-6">
        <section className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">Pedidos</p>
              <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight text-black md:text-4xl">Acompanhar pedidos</h1>
              <p className="mt-2 text-sm text-black/55">
                Consulte o andamento, o total e o status da sua compra.
              </p>
            </div>
            <div className="hidden rounded-[1.1rem] bg-[#f7f3ec] px-3 py-2 text-right md:block">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">Pedidos recentes</p>
              <p className="mt-1 text-lg font-semibold text-black md:text-xl">{orders.length}</p>
            </div>
          </div>

          {params?.sucesso ? (
            <div className="mt-4 rounded-[1.25rem] border border-[#d9eadf] bg-[#f3fbf4] px-4 py-3 text-sm text-[#2f6a43]">
              Pedido confirmado com sucesso: <strong>{params.sucesso}</strong>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Pagamentos aprovados",
              value: "2",
              hint: "Pedidos com reserva confirmada",
              icon: <ReceiptText size={16} />
            },
            {
              label: "Em andamento",
              value: "2",
              hint: "Separacao, transporte ou retirada",
              icon: <Clock3 size={16} />
            },
            {
              label: "Entregas em rota",
              value: "1",
              hint: "Pedidos ja despachados",
              icon: <Truck size={16} />
            }
          ].map((item) => (
            <div key={item.label} className="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[1.6rem] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/45">{item.label}</p>
                <div className="rounded-full bg-[#f7f3ec] p-2 text-[#8b6743]">{item.icon}</div>
              </div>
              <p className="mt-3 text-[1.9rem] font-semibold leading-none text-black md:text-3xl">{item.value}</p>
              <p className="mt-2 text-sm text-black/55">{item.hint}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3 md:space-y-4">
          {orders.map((order) => {
            const status = getStatusStyles(order.statusTone);
            return (
              <article
                key={order.id}
                className="rounded-[1.45rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[1.8rem] md:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-black">{order.id}</p>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
                        {status.icon}
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-black/58">{order.message}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:min-w-[22rem]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-black/35">Data</p>
                      <p className="mt-1 text-sm font-medium text-black">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-black/35">Itens</p>
                      <p className="mt-1 text-sm font-medium text-black">{order.items}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-black/35">Total</p>
                      <p className="mt-1 text-sm font-semibold text-black">{order.total}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-full bg-[#f2ede4]">
                  <div
                    className={`h-2 rounded-full ${
                      order.statusTone === "shipping"
                        ? "w-[82%] bg-[#2856a6]"
                        : order.statusTone === "preparing"
                          ? "w-[48%] bg-[#c58b59]"
                          : "w-full bg-[#2f6a43]"
                    }`}
                  />
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
