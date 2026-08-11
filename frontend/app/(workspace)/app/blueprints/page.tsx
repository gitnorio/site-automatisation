import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blueprints — Espace entreprise", robots: { index: false, follow: false } };

export default function BlueprintsPage() {
  return <section className="enterprise-page">
    <div className="enterprise-page__heading"><div><span>Configuration</span><h1>Blueprints</h1><p>Définissez les informations que Koto doit obtenir avant la rencontre humaine.</p></div></div>
    <article className="blueprint-card"><div><span className="enterprise-status"><CheckCircle2 aria-hidden="true" /> Blueprint initial</span><h2>Agence marketing v1</h2><p>Le cadre MVP pour qualifier un besoin marketing, vérifier les objectifs obligatoires et préparer un brief structuré.</p></div><div className="blueprint-card__meta"><span>14 objectifs</span><span>6 questions imposées</span><span>10–14 questions maximum</span></div><button type="button" disabled>Ouvrir le blueprint <ArrowUpRight aria-hidden="true" /></button></article>
  </section>;
}
