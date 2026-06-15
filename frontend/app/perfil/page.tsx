export default function ProfilePage() {
  return (
    <main className="shell space-y-6 py-8">
      <section className="rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Minha conta</p>
        <h1 className="mt-3 font-display text-4xl">Perfil e acompanhamento</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Dados pessoais, historico de pedidos, favoritos e notificacoes em um unico lugar.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-xl font-semibold text-black">Dados pessoais</h2>
          <div className="mt-5 grid gap-3 text-sm text-black/65">
            <p><strong className="text-black">Nome:</strong> Cliente Demo</p>
            <p><strong className="text-black">E-mail:</strong> cliente@bazardetudo.com</p>
            <p><strong className="text-black">WhatsApp:</strong> (19) 99999-9999</p>
            <p><strong className="text-black">Endereco:</strong> Sao Mateus</p>
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

