import { Bell, DatabaseZap, ShieldCheck, UserRoundCheck, Webhook } from "lucide-react";
import type { Metadata } from "next";

import { getWorkspaceIntegrationSettings } from "@/features/workspace/api/workspace";
import type { WorkspaceIntegrationSettings } from "@/features/workspace/api/workspace";
import { WorkspaceLoadError } from "@/features/workspace/components/WorkspaceConsultations";


export const metadata: Metadata = { title: "Paramètres — Espace entreprise", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await loadIntegrationSettings();
  if (!result.ok) return <WorkspaceLoadError message={result.error} />;
  const settings = result.data;
  return <section className="enterprise-page">
    <div className="enterprise-page__heading"><div><span>Organisation</span><h1>Paramètres</h1><p>Contrôlez l’identité du parcours et le connecteur pilote utilisé après chaque consultation.</p></div></div>
    <div className="enterprise-settings"><label>Nom affiché<input value="Votre agence" readOnly /></label><label>Logo de consultation<div className="enterprise-logo-placeholder">Votre Logo</div></label><label>Langue de consultation<select defaultValue="fr-CA" disabled><option value="fr-CA">Français (Canada)</option></select></label></div>
    <section className="integration-settings">
      <div className="integration-settings__heading"><div><Webhook aria-hidden="true" /><span>Connecteur pilote</span></div><strong className={settings.enabled ? "is-enabled" : ""}>{settings.enabled ? "Actif" : "Désactivé"}</strong></div>
      <div className="integration-settings__summary"><div><span>Fournisseur</span><strong>{settings.provider === "webhook" ? "Webhook générique signé" : "Aucun connecteur"}</strong></div><div><span>Politique de reprise</span><strong>Jusqu’à {settings.max_attempts} tentatives</strong></div><div><span>Sécurité</span><strong><ShieldCheck aria-hidden="true" /> HMAC + idempotence</strong></div></div>
      <div className="integration-settings__actions"><Action icon={DatabaseZap} label="Dossier CRM" /><Action icon={UserRoundCheck} label="Assignation" /><Action icon={Bell} label="Notification" /><Action icon={Webhook} label="Webhook" /></div>
      <p>La destination et le secret sont gérés uniquement par variables serveur. Ils ne sont jamais transmis au navigateur.</p>
    </section>
  </section>;
}

function Action({ icon: Icon, label }: { icon: typeof Webhook; label: string }) {
  return <span><Icon aria-hidden="true" />{label}</span>;
}

async function loadIntegrationSettings(): Promise<
  { ok: true; data: WorkspaceIntegrationSettings } | { ok: false; error: string }
> {
  try {
    return { ok: true, data: await getWorkspaceIntegrationSettings() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Une erreur inattendue est survenue." };
  }
}
