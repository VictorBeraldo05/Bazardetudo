import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="shell py-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Entrar</p>
        <h1 className="mt-3 font-display text-4xl text-black">Acesse sua conta</h1>
        <div className="mt-6 grid gap-3">
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="E-mail" />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Senha" type="password" />
          <button className="rounded-full bg-black px-5 py-3 text-white">Entrar</button>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-black/55">
          <Link href="/cadastro">Criar conta</Link>
          <Link href="/admin/login">Acesso admin</Link>
        </div>
      </div>
    </main>
  );
}
