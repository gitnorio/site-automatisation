import "@fontsource-variable/inter";
import "@fontsource-variable/radio-canada";
import "./globals.css";
import "./koto.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Koto — Découverte client, CRM et automatisations", template: "%s | Koto" },
  description: "Koto mène une consultation client adaptative, structure le brief, synchronise votre CRM et déclenche la suite de vos opérations.",
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
