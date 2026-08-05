import { Suspense } from "react";

import { ContactForm } from "@/components/contact/ContactForm";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Planifier une consultation", "Présentez à Astrapio un processus répétitif, un besoin d’intégration ou une difficulté d’accès à l’information.", "/contact");

export default function ContactPage() { return <div className="page-shell page-stack"><RetroWindow title="Contact — Nouvelle demande" headingLevel="h1" controls><h2 className="section-heading">Parlons de votre processus.</h2><p className="section-lede">Décrivez le travail répétitif, le besoin d’accès à l’information ou les logiciels que vous souhaitez mieux connecter. Nous utiliserons ces renseignements uniquement pour comprendre votre demande et communiquer avec vous.</p></RetroWindow><RetroWindow title="Formulaire de consultation"><Suspense fallback={<p>Chargement du formulaire…</p>}><ContactForm /></Suspense></RetroWindow></div>; }

