export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white/60">
      <div className="shell grid gap-6 py-10 text-sm text-black/65 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-black">Bazar de Tudo</p>
          <p>Rua Virginia Pratta Gregolin, 1111 - Sao Mateus</p>
        </div>
        <div>
          <p>WhatsApp: (19) 99825-3607</p>
          <p>Terca a Sexta: 09h as 17h</p>
          <p>Sabado: 09h as 14h</p>
        </div>
        <div>
          <p>Plataforma pensada para substituir a operacao manual via grupos de WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}

