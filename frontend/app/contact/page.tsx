import { Suspense } from "react";

import { ContactForm } from "@/components/contact/ContactForm";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Contact", "Parlez-nous de votre processus de découverte client et de votre projet pilote Koto.", "/contact");

export default function ContactPage() {
  return <div className="koto-contact-page"><section className="koto-contact-intro"><p className="koto-pill-label">Demander une démo</p><h1>Parlons de votre processus de découverte.</h1><p>Décrivez comment votre équipe prépare aujourd’hui ses premiers échanges clients. Nous cadrerons ensemble le Blueprint, le volume de consultations et les intégrations utiles au pilote.</p><div className="koto-contact-points"><span>Réponse humaine</span><span>Cadrage sans engagement</span><span>Aucune donnée sensible requise</span></div></section><section className="koto-contact-panel"><h2>Présentez-nous votre contexte.</h2><Suspense fallback={<p>Chargement du formulaire…</p>}><ContactForm /></Suspense></section></div>;
}
