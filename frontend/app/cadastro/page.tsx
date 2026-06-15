export default function SignupPage() {
  return (
    <main className="shell py-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
        <h1 className="font-display text-3xl">Criar conta</h1>
        <div className="mt-4 grid gap-3">
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Nome completo" />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="E-mail" />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="WhatsApp" />
          <button className="rounded-full bg-black px-5 py-3 text-white">Cadastrar</button>
        </div>
      </div>
    </main>
  );
}

