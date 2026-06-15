import Link from "next/link";

export default function AdminNoAccessPage() {
  return (
    <main className="shell flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Acesso bloqueado</p>
        <h1 className="mt-3 font-display text-4xl text-black">Sua conta nao tem permissao para entrar no painel.</h1>
        <p className="mt-4 text-sm text-black/60">
          O acesso administrativo depende do campo <code>is_admin</code> no perfil do usuario no banco.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/"><span className="inline-flex rounded-full bg-black px-5 py-3 text-sm text-white">Voltar para a loja</span></Link>
          <Link href="/admin/login"><span className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm text-black">Tentar outro login</span></Link>
        </div>
      </div>
    </main>
  );
}
