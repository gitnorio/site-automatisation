import "@fontsource-variable/inter";
import "@fontsource-variable/radio-canada";
import "./styles/tokens.css";
import "./styles/base.css";
import "@/features/contact/styles/contact.css";
import "@/features/marketing/styles/marketing.css";
import "@/features/workspace/styles/workspace.css";
import "@/features/consultation/styles/consultation.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

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
        {children}
      </body>
    </html>
  );
}
