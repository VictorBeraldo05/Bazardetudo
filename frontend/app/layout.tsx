import type { Metadata } from "next";

import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Bazar de Tudo",
  description: "Loja online da Bazar de Tudo com ofertas, destaques e checkout completo."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
