import Image from "next/image";

import { RetroButton } from "@/components/retro/RetroButton";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("À propos de nous", "Découvrez la mission, les principes et l’approche québécoise d’Astrapio.", "/a-propos");

export default function AboutPage() {
  return <div className="page-shell page-stack">
    <RetroWindow title="À propos de nous — Astrapio" headingLevel="h1" controls>
      <div className="hero-grid"><div><h2 className="section-heading">L’IA devient utile lorsqu’elle s’intègre vraiment.</h2><p className="section-lede">Astrapio est née d’une conviction simple : l’intelligence artificielle devient réellement utile lorsqu’elle s’intègre aux outils, aux données et aux processus d’une entreprise.</p><p className="section-lede" style={{ marginTop: "1rem" }}>Nous sommes une jeune entreprise technologique québécoise qui privilégie les solutions compréhensibles, mesurables et adaptées à la réalité des PME.</p></div><div className="editorial-image"><Image src="/images/editorial/about-team.webp" alt="Équipe québécoise collaborant autour d’une table de travail" width={1200} height={900} /></div></div>
    </RetroWindow>
    <RetroWindow title="Nos principes — Configuration active">
      <div className="grid-3">{[["Utilité", "Partir d’un problème opérationnel réel."], ["Simplicité", "Expliquer clairement les choix et les limites."], ["Transparence", "Rendre visibles les sources, coûts et responsabilités."], ["Sécurité", "Limiter les accès et les données dès la conception."], ["Validation humaine", "Conserver un contrôle humain lorsque les conséquences l’exigent."], ["Évolution durable", "Construire par étapes, mesurer et améliorer."]].map(([title, copy]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </RetroWindow>
    <RetroWindow title="Portrait du fondateur — À compléter"><div className="inset-panel"><strong>Information à personnaliser avant publication</strong><p>Cette section accueillera le portrait, le nom et le parcours du fondateur lorsqu’ils auront été fournis et validés.</p></div><div className="button-row"><RetroButton href="/contact" variant="primary">Discuter avec Astrapio</RetroButton></div></RetroWindow>
  </div>;
}
