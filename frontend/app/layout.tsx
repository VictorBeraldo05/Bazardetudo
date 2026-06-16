import type { Metadata, Viewport } from "next";

import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Bazar de Tudo",
  description: "Loja online da Bazar de Tudo com ofertas, destaques e checkout completo."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
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
