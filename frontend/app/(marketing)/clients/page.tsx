import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Cas d’usage — Koto",
  "Découvrez comment Koto prépare les consultations des agences marketing, cabinets-conseils et équipes de services B2B.",
  "/clients",
);

const useCases = [
  {
    title: "Agences marketing",
    description: "Comprendre le déclencheur, les objectifs, les canaux actuels, le budget et le processus de décision avant le premier appel.",
    image: "/images/editorial/about-team.webp",
    alt: "Équipe d’agence marketing réunie autour d’un dossier client",
  },
  {
    title: "Cabinets-conseils",
    description: "Recueillir un contexte riche sans transformer l’expérience en formulaire administratif ou en recommandation automatique.",
    image: "/images/editorial/methodology-table.webp",
    alt: "Équipe-conseil structurant une méthodologie de travail",
  },
  {
    title: "Services B2B",
    description: "Transmettre un brief structuré aux bonnes personnes et synchroniser les données autorisées vers le CRM.",
    image: "/images/editorial/blog-tools.webp",
    alt: "Environnement numérique utilisé par une équipe de services B2B",
  },
] as const;

const pilotCriteria = [
  "Le prospect comprend l’expérience immédiatement.",
  "Les questions de suivi sont pertinentes et non répétitives.",
  "La consultation reste courte et rassurante.",
  "Le brief final est utile avant la rencontre humaine.",
  "Les garde-fous empêchent toute recommandation prématurée.",
  "L’équipe conserve le jugement et la relation client.",
] as const;

export default function ClientsPage() {
  return (
    <div className="koto-marketing-page">
      <section className="koto-page-hero koto-page-shell">
        <p className="koto-pill-label">Cas d’usage</p>
        <h1>Une meilleure découverte, avant de mobiliser votre équipe.</h1>
        <p>Koto est d’abord conçu pour les agences marketing boutique. Son approche convient aussi aux équipes de services qui doivent comprendre un besoin complexe avant de proposer la suite.</p>
      </section>

      <section className="koto-use-case-feature koto-page-shell" aria-label="Cas d’usage de Koto">
        {useCases.map((useCase) => (
          <article key={useCase.title}>
            <div className="koto-use-case-feature__media"><Image src={useCase.image} alt={useCase.alt} fill sizes="(max-width: 760px) 100vw, 33vw" /></div>
            <div><h2>{useCase.title}</h2><p>{useCase.description}</p><Link href="/contact">Évaluer ce cas d’usage <ArrowRight aria-hidden="true" /></Link></div>
          </article>
        ))}
      </section>

      <section className="koto-pilot-section">
        <div className="koto-page-shell">
          <div><p className="koto-pill-label">Programme pilote</p><h2>Ce que Koto doit prouver sur le terrain.</h2><p>Le produit est en phase MVP. Les premiers déploiements servent à valider la qualité de l’expérience prospect et l’utilité réelle du brief pour l’agence.</p></div>
          <ul>{pilotCriteria.map((criterion) => <li key={criterion}><Check aria-hidden="true" />{criterion}</li>)}</ul>
        </div>
      </section>

      <section className="koto-final-wrap koto-final-wrap--compact"><div className="koto-final-cta"><h2>Votre processus de découverte mérite-t-il un pilote?</h2><div className="koto-action-row"><Link className="koto-button koto-button--mint" href="/contact">Parler à l’équipe</Link><Link className="koto-button koto-button--outline" href="/#fonctionnement">Voir le produit</Link></div></div></section>
    </div>
  );
}
