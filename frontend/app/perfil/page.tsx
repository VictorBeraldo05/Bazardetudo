import { cookies } from "next/headers";

import { AUTH_USER_COOKIE } from "@/lib/admin-auth";
import { NavigationLink } from "@/components/navigation-link";

type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
};

export default async function ProfilePage() {
  const rawUser = (await cookies()).get(AUTH_USER_COOKIE)?.value;
  const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;

  if (!user) {
    return (
      <main className="shell py-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-card">
          <h1 className="font-display text-4xl text-black">Entre para ver seu perfil</h1>
          <p className="mt-3 text-black/60">Sua conta ainda nao esta autenticada nesta sessao.</p>
          <div className="mt-6 flex gap-3">
            <NavigationLink href="/login" className="rounded-full bg-black px-5 py-3 text-sm text-white">Entrar</NavigationLink>
            <NavigationLink href="/cadastro" className="rounded-full border border-black/10 px-5 py-3 text-sm text-black">Criar conta</NavigationLink>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell space-y-6 py-6 md:py-8">
      <section className="rounded-[2rem] bg-[#111111] p-6 text-white shadow-card md:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Minha conta</p>
        <h1 className="mt-2 font-display text-4xl">Perfil e acompanhamento</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Dados pessoais, historico de pedidos, favoritos e notificacoes em um unico lugar.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-black">Dados pessoais</h2>
          <div className="mt-5 grid gap-3 text-sm text-black/65">
            <p><strong className="text-black">Nome:</strong> {user.full_name}</p>
            <p><strong className="text-black">E-mail:</strong> {user.email}</p>
            <p><strong className="text-black">Perfil:</strong> {user.is_admin ? "Administrador" : "Cliente"}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-black">Ultimos pedidos</h2>
          <div className="mt-5 space-y-3">
            {["BDT-10496404", "BDT-7A23AA11"].map((order) => (
              <div key={order} className="rounded-[1.5rem] bg-[#f6f2eb] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-black">{order}</p>
                  <span className="rounded-full bg-black px-3 py-1 text-xs text-white">Em transporte</span>
                </div>
                <p className="mt-2 text-sm text-black/58">Pagamento aprovado e acompanhamento liberado.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
