import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paramètres — Espace entreprise", robots: { index: false, follow: false } };

export default function SettingsPage() {
  return <section className="enterprise-page">
    <div className="enterprise-page__heading"><div><span>Organisation</span><h1>Paramètres</h1><p>Gérez l’identité qui sera présentée aux prospects pendant leurs consultations.</p></div></div>
    <div className="enterprise-settings"><label>Nom affiché<input value="Votre agence" readOnly /></label><label>Logo de consultation<div className="enterprise-logo-placeholder">Votre Logo</div></label><label>Langue de consultation<select defaultValue="fr-CA" disabled><option value="fr-CA">Français (Canada)</option></select></label></div>
  </section>;
}
