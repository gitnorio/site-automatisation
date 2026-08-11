import { Check, ShieldCheck, Workflow } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Tarifs — Koto",
  "Une tarification Koto adaptée au volume de consultations, aux parcours et aux intégrations de votre agence.",
  "/tarifs",
);

const foundations = [
  "Consultation adaptative en marque blanche",
  "Blueprint contrôlé par votre agence",
  "Brief final structuré et réponses brutes",
  "Progression et objectifs suivis par le backend",
  "Garde-fous contre les recommandations prématurées",
  "Synchronisation CRM de base selon le projet pilote",
] as const;

export default function TarifsPage() {
  return (
    <div className="koto-marketing-page">
      <section className="koto-pricing-hero koto-page-shell">
        <div><p className="koto-pill-label">Tarifs</p><h1>Conçu pour votre volume de découverte client.</h1><p>Koto combine une fondation SaaS avec une tarification adaptée au nombre de consultations, aux parcours et aux intégrations dont votre équipe a besoin.</p></div>
        <aside><span>Obtenir une proposition adaptée</span><h2>Parlons de votre processus actuel.</h2><p>Nous cadrons le volume, le Blueprint, le niveau de personnalisation et le premier connecteur CRM avant de proposer un pilote.</p><Link className="koto-button koto-button--dark" href="/contact">Demander une démo</Link></aside>
      </section>

      <section className="koto-pricing-row koto-page-shell">
        <div className="koto-pricing-row__media"><Image src="/images/product/astrapio-discovery-platform-light-v2.webp" alt="Vue interne Koto présentant la progression d’une consultation" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
        <div><ShieldCheck aria-hidden="true" /><h2>Une fondation stable pour lancer le pilote.</h2><ul>{foundations.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul><Link className="koto-button koto-button--mint" href="/contact">Parler à l’équipe</Link></div>
      </section>

      <section className="koto-pricing-row koto-pricing-row--reverse koto-page-shell">
        <div className="koto-pricing-row__media"><Image src="/images/product/consultation-marque-blanche-wall-logo-v6.webp" alt="Consultation Koto en marque blanche avec choix de réponse" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
        <div><Workflow aria-hidden="true" /><h2>Le prix suit les usages qui créent de la valeur.</h2><p>Le volume de consultations, le nombre de parcours, la personnalisation et les intégrations déterminent l’offre. Les automatisations complexes, la voix et l’analyse documentaire restent hors du MVP.</p><ul><li><Check aria-hidden="true" />Un parcours pour commencer simplement</li><li><Check aria-hidden="true" />Plusieurs parcours lorsque le besoin est validé</li><li><Check aria-hidden="true" />Accompagnement spécifique pour les déploiements avancés</li></ul><Link className="koto-button koto-button--mint" href="/contact">Évaluer votre besoin</Link></div>
      </section>

      <section className="koto-final-wrap koto-final-wrap--compact"><div className="koto-final-cta"><h2>Prêt à cadrer un premier pilote Koto?</h2><div className="koto-action-row"><Link className="koto-button koto-button--mint" href="/contact">Nous contacter</Link><Link className="koto-button koto-button--outline" href="/clients">Voir les cas d’usage</Link></div></div></section>
    </div>
  );
}
