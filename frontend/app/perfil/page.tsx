import { cookies } from "next/headers";
import { BellRing, Heart, PackageSearch, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";

import { NavigationLink } from "@/components/navigation-link";
import { AUTH_USER_COOKIE } from "@/lib/admin-auth";

type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
};

const recentOrders = [
  {
    id: "BDT-10496404",
    status: "Em transporte",
    tone: "shipping",
    description: "Pagamento aprovado e entrega em andamento.",
    total: "R$ 1.389,90"
  },
  {
    id: "BDT-7A23AA11",
    status: "Separacao",
    tone: "preparing",
    description: "Seu pedido esta sendo preparado pela loja.",
    total: "R$ 349,00"
  }
];

function getStatusStyles(tone: string) {
  if (tone === "shipping") {
    return "bg-[#e8f0ff] text-[#2856a6]";
  }

  if (tone === "preparing") {
    return "bg-[#f8ecd3] text-[#8a6230]";
  }

  return "bg-[#dff2e4] text-[#2f6a43]";
}

export default async function ProfilePage() {
  const rawUser = (await cookies()).get(AUTH_USER_COOKIE)?.value;
  const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;

  if (!user) {
    return (
      <main className="shell pb-8 pt-4 md:pt-8">
        <section className="mx-auto max-w-3xl rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">Minha conta</p>
          <h1 className="mt-2 text-[1.8rem] font-semibold leading-tight text-black md:text-4xl">
            Entre para acompanhar seus pedidos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/58">
            Acesse seu perfil para consultar compras, favoritos e alertas de produtos.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { label: "Pedidos", hint: "Veja entregas e status", icon: <ShoppingBag size={16} /> },
              { label: "Favoritos", hint: "Monte alertas de chegada", icon: <Heart size={16} /> },
              { label: "Conta", hint: "Dados pessoais e acesso", icon: <ShieldCheck size={16} /> }
            ].map((item) => (
              <div key={item.label} className="rounded-[1.3rem] bg-[#f8f4ed] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-black">{item.label}</p>
                  <div className="rounded-full bg-white p-2 text-[#8b6743]">{item.icon}</div>
                </div>
                <p className="mt-2 text-sm text-black/55">{item.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <NavigationLink href="/login" className="inline-flex h-12 items-center justify-center rounded-[1rem] bg-[#e05a36] px-5 text-sm font-semibold text-white">
              Entrar
            </NavigationLink>
            <NavigationLink href="/cadastro" className="inline-flex h-12 items-center justify-center rounded-[1rem] border border-black/10 bg-white px-5 text-sm font-semibold text-black">
              Criar conta
            </NavigationLink>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell pb-8 pt-4 md:pt-8">
      <div className="space-y-5 md:space-y-6">
        <section className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">Minha conta</p>
              <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight text-black md:text-4xl">Perfil e acompanhamento</h1>
              <p className="mt-2 text-sm text-black/55">
                Dados pessoais, pedidos, favoritos e alertas em um unico lugar.
              </p>
            </div>
            <div className="hidden rounded-[1.1rem] bg-[#f7f3ec] px-3 py-2 text-right md:block">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">Perfil</p>
              <p className="mt-1 text-lg font-semibold text-black">{user.is_admin ? "Administrador" : "Cliente"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Pedidos recentes",
              value: "2",
              hint: "Compras acompanhadas na conta",
              icon: <ShoppingBag size={16} />
            },
            {
              label: "Alertas ativos",
              value: "3",
              hint: "Avisos de chegada por e-mail",
              icon: <BellRing size={16} />
            },
            {
              label: "Favoritos",
              value: "6",
              hint: "Itens salvos para consultar depois",
              icon: <Heart size={16} />
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

        <div className="grid gap-5 xl:grid-cols-[0.84fr_1.16fr]">
          <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-[1rem] bg-[#f7f2ea] p-2.5 text-[#8b6743]">
                <UserRound size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black md:text-xl">Dados pessoais</h2>
                <p className="mt-1 text-sm text-black/55">Informacoes principais da sua conta.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { label: "Nome", value: user.full_name },
                { label: "E-mail", value: user.email },
                { label: "Tipo de conta", value: user.is_admin ? "Administrador" : "Cliente" }
              ].map((item) => (
                <div key={item.label} className="rounded-[1.2rem] bg-[#f8f4ed] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/35">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-black md:text-base">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              <NavigationLink href="/pedidos" className="inline-flex h-11 items-center justify-center rounded-[1rem] bg-[#e05a36] px-4 text-sm font-semibold text-white">
                Ver meus pedidos
              </NavigationLink>
              <NavigationLink href="/favoritos" className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-black/10 bg-white px-4 text-sm font-semibold text-black">
                Abrir favoritos e alertas
              </NavigationLink>
            </div>
          </section>

          <section className="space-y-4">
            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-[1rem] bg-[#f7f2ea] p-2.5 text-[#8b6743]">
                  <PackageSearch size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black md:text-xl">Ultimos pedidos</h2>
                  <p className="mt-1 text-sm text-black/55">Acompanhe rapidamente o andamento das compras.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {recentOrders.map((order) => (
                  <article key={order.id} className="rounded-[1.35rem] bg-[#f8f4ed] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-black">{order.id}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(order.tone)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-black/58">{order.description}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/35">Total</p>
                        <p className="mt-1 text-sm font-semibold text-black">{order.total}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-[1rem] bg-[#f7f2ea] p-2.5 text-[#8b6743]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black md:text-xl">Conta protegida</h2>
                  <p className="mt-1 text-sm text-black/55">
                    Use esta area para acompanhar suas compras e centralizar seu relacionamento com a loja.
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
