export default function ContactPage() {
  return (
    <main className="shell py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
          <h1 className="font-display text-4xl">Contato</h1>
          <div className="mt-4 space-y-3 text-black/65">
            <p>Rua Virginia Pratta Gregolin, 1111 - Sao Mateus</p>
            <p>WhatsApp: (19) 99825-3607</p>
            <p>Terca a Sexta: 09h as 17h</p>
            <p>Sabado: 09h as 14h</p>
          </div>
        </section>
        <section className="rounded-[2rem] border border-black/5 bg-black p-6 text-white shadow-card">
          <h2 className="font-display text-3xl">Atendimento rapido</h2>
          <p className="mt-4 text-white/70">
            Perfeito para integracao futura com WhatsApp Business API e campanhas automáticas.
          </p>
        </section>
      </div>
    </main>
  );
}

