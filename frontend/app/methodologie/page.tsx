import Image from "next/image";

import { RetroButton } from "@/components/retro/RetroButton";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Notre méthodologie", "Une méthode en sept étapes pour analyser, tester, intégrer et améliorer une solution IA.", "/methodologie");

const steps = [
  ["Consultation initiale", "Comprendre le problème, les utilisateurs et le résultat recherché.", "Résumé du besoin et prochaines informations requises."],
  ["Cartographie du processus", "Documenter les étapes, données, logiciels et points de friction actuels.", "Carte du processus et des responsabilités."],
  ["Évaluation", "Déterminer ce qui peut être automatisé, les risques, coûts et critères de réussite.", "Recommandation et portée du pilote."],
  ["Projet pilote", "Créer une première version limitée, observable et mesurable.", "Pilote testé sur un périmètre convenu."],
  ["Intégration", "Connecter la solution aux accès et systèmes autorisés.", "Flux intégré avec contrôles et journalisation."],
  ["Déploiement", "Tester, documenter et accompagner les utilisateurs.", "Version déployée et documentation d’utilisation."],
  ["Suivi", "Surveiller les cas réels, corriger et améliorer progressivement.", "Liste d’améliorations priorisée et suivi convenu."],
] as const;

export default function MethodologyPage() {
  return <div className="page-shell page-stack">
    <RetroWindow title="Notre méthodologie — Processus en 7 étapes" headingLevel="h1" controls><div className="hero-grid"><div><h2 className="section-heading">Avancer par étapes vérifiables.</h2><p className="section-lede">Chaque mandat commence par le processus réel de l’entreprise. Nous définissons ce qui doit être automatisé, ce qui doit rester sous contrôle humain et comment mesurer la réussite.</p></div><div className="pixel-frame"><Image src="/images/pixel-art/methodology-workflow.webp" alt="Sept postes reliés représentant les étapes d’un projet Astrapio" width={960} height={720} /></div></div></RetroWindow>
    {steps.map(([title, objective, deliverable], index) => <RetroWindow title={`Étape ${index + 1} — ${title}`} key={title}><div className="grid-2"><div><span className="eyebrow">Objectif</span><p className="section-lede">{objective}</p></div><div className="inset-panel"><strong>Livrable attendu</strong><p>{deliverable}</p><strong>Passage à l’étape suivante</strong><p>Validation conjointe du périmètre, des accès et des responsabilités.</p></div></div></RetroWindow>)}
    <RetroWindow title="Démarrer — Consultation initiale"><div className="grid-2"><h2 className="section-heading">Présentez-nous votre processus actuel.</h2><div><p className="section-lede">Nous commencerons par comprendre le travail, les outils et les personnes concernées.</p><div className="button-row"><RetroButton href="/contact" variant="primary">Planifier une consultation</RetroButton></div></div></div></RetroWindow>
  </div>;
}

