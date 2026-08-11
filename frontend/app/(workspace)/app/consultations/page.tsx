import { ArrowUpRight, CircleDashed, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Consultations — Espace entreprise", robots: { index: false, follow: false } };

export default function ConsultationsPage() {
  return <section className="enterprise-page">
    <div className="enterprise-page__heading"><div><span>Opérations</span><h1>Consultations</h1><p>Créez, envoyez et suivez les consultations de découverte de votre agence.</p></div><button type="button" disabled><Plus aria-hidden="true" /> Nouvelle consultation</button></div>
    <div className="enterprise-metrics"><article><span>En cours</span><strong>0</strong></article><article><span>Terminées</span><strong>0</strong></article><article><span>À réviser</span><strong>0</strong></article></div>
    <div className="enterprise-empty"><CircleDashed aria-hidden="true" /><h2>Aucune consultation pour le moment</h2><p>La création de consultations sera activée avec le moteur Discovery. L’architecture de l’espace agence est déjà prête à l’accueillir.</p><Link href="/app/blueprints">Voir le blueprint initial <ArrowUpRight aria-hidden="true" /></Link></div>
  </section>;
}
