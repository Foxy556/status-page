import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Status", template: "%s · status-page" },
  description: "Painel de status de serviços: latência, código HTTP e histórico recente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
