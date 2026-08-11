import "./globals.css";
import "./dominium.css";
import "./dominium-sections.css";
import "./dominium-responsive.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Astrapio — Discovery, CRM et automatisations", template: "%s | Astrapio" },
  description: "Astrapio qualifie vos prospects, structure leur brief, synchronise votre CRM et déclenche les automatisations de votre agence.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr-CA" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">Aller au contenu</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
