import Image from "next/image";

import { RetroButton } from "@/components/retro/RetroButton";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("À propos de nous", "Découvrez la mission, les principes et l’approche québécoise d’Astrapio.", "/a-propos");

const principles = [
  ["Utilité", "Partir d’un problème opérationnel réel."],
  ["Simplicité", "Expliquer clairement les choix et les limites."],
  ["Transparence", "Rendre visibles les sources, coûts et responsabilités."],
  ["Sécurité", "Limiter les accès et les données dès la conception."],
  ["Validation humaine", "Conserver un contrôle humain lorsque les conséquences l’exigent."],
  ["Évolution durable", "Construire par étapes, mesurer et améliorer."],
] as const;

export default function AboutPage() {
  return <div className="page-shell page-stack">
    <RetroWindow title="À propos de nous" headingLevel="h1">
      <div className="hero-grid"><div><p className="eyebrow">Entreprise technologique québécoise</p><h2 className="section-heading">L’IA devient utile lorsqu’elle s’intègre vraiment.</h2><p className="section-lede">Astrapio conçoit des solutions compréhensibles, mesurables et adaptées à la réalité des PME. Nous relions les outils, les données et les personnes plutôt que d’ajouter une technologie isolée.</p></div><div className="pixel-frame"><Image src="/images/accenture-inspired/team-collaboration.webp" alt="Équipe collaborant dans un studio technologique québécois" width={960} height={1200} /></div></div>
    </RetroWindow>
    <RetroWindow title="Nos principes"><div className="grid-3">{principles.map(([title, copy]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></RetroWindow>
    <RetroWindow title="Rencontrer Astrapio"><div className="grid-2"><h2 className="section-heading">Construire une automatisation qui sert vraiment le travail.</h2><div><p className="section-lede">Présentez-nous un processus qui ralentit votre équipe. Nous identifierons un premier périmètre réaliste.</p><div className="button-row"><RetroButton href="/contact" variant="primary">Discuter avec Astrapio</RetroButton></div></div></div></RetroWindow>
  </div>;
}
