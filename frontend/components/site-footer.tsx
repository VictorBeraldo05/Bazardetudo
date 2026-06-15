"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-20 bg-[#121212] text-white">
      <div className="shell grid gap-8 py-12 text-sm text-white/70 md:grid-cols-4">
        <div>
          <p className="font-display text-xl text-white">Bazar de Tudo</p>
          <p className="mt-3">Uma vitrine online pensada para vender com clareza, agilidade e visual forte.</p>
        </div>
        <div>
          <p className="font-semibold text-white">Atendimento</p>
          <p className="mt-3">WhatsApp: (19) 99825-3607</p>
          <p>Terca a Sexta: 09h as 17h</p>
          <p>Sabado: 09h as 14h</p>
        </div>
        <div>
          <p className="font-semibold text-white">Loja</p>
          <p className="mt-3">Rua Virginia Pratta Gregolin, 1111</p>
          <p>Sao Mateus</p>
          <p>Retirada e entrega combinada</p>
        </div>
        <div>
          <p className="font-semibold text-white">Institucional</p>
          <p className="mt-3">Compra segura</p>
          <p>Acompanhamento de pedidos</p>
          <p>Curadoria de oportunidades</p>
        </div>
      </div>
    </footer>
  );
}
