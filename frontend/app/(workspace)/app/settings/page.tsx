import { Bell, DatabaseZap, ShieldCheck, UserRoundCheck, Webhook } from "lucide-react";
import type { Metadata } from "next";

import { getWorkspaceIntegrationSettings } from "@/features/workspace/api/workspace";
import { getWorkspaceQualificationSettings } from "@/features/workspace/api/workspace";
import type {
  WorkspaceIntegrationSettings,
  WorkspaceQualificationSettingsList,
} from "@/features/workspace/api/workspace";
import { QualificationSettingsPanel } from "@/features/workspace/components/QualificationSettingsForm";
import { WorkspaceLoadError } from "@/features/workspace/components/WorkspaceConsultations";


export const metadata: Metadata = { title: "Paramètres — Espace entreprise", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await loadSettings();
  if (!result.ok) return <WorkspaceLoadError message={result.error} />;
  const { integrations, qualification } = result.data;
  return <section className="enterprise-page">
    <div className="enterprise-page__heading"><div><span>Organisation</span><h1>Paramètres</h1><p>Contrôlez l’identité du parcours, la qualification des dossiers et le connecteur pilote.</p></div></div>
    <div className="enterprise-settings"><label>Nom affiché<input value="Votre agence" readOnly /></label><label>Logo de consultation<div className="enterprise-logo-placeholder">Votre Logo</div></label><label>Langue de consultation<select defaultValue="fr-CA" disabled><option value="fr-CA">Français (Canada)</option></select></label></div>
    <QualificationSettingsPanel organizations={qualification.organizations} />
    <section className="integration-settings">
      <div className="integration-settings__heading"><div><Webhook aria-hidden="true" /><span>Connecteur pilote</span></div><strong className={integrations.enabled ? "is-enabled" : ""}>{integrations.enabled ? "Actif" : "Désactivé"}</strong></div>
      <div className="integration-settings__summary"><div><span>Fournisseur</span><strong>{integrations.provider === "webhook" ? "Webhook générique signé" : "Aucun connecteur"}</strong></div><div><span>Politique de reprise</span><strong>Jusqu’à {integrations.max_attempts} tentatives</strong></div><div><span>Sécurité</span><strong><ShieldCheck aria-hidden="true" /> HMAC + idempotence</strong></div></div>
      <div className="integration-settings__actions"><Action icon={DatabaseZap} label="Dossier CRM" /><Action icon={UserRoundCheck} label="Assignation" /><Action icon={Bell} label="Notification" /><Action icon={Webhook} label="Webhook" /></div>
      <p>La destination et le secret sont gérés uniquement par variables serveur. Ils ne sont jamais transmis au navigateur.</p>
    </section>
  </section>;
}

function Action({ icon: Icon, label }: { icon: typeof Webhook; label: string }) {
  return <span><Icon aria-hidden="true" />{label}</span>;
}

async function loadSettings(): Promise<
  { ok: true; data: { integrations: WorkspaceIntegrationSettings; qualification: WorkspaceQualificationSettingsList } }
  | { ok: false; error: string }
> {
  try {
    const [integrations, qualification] = await Promise.all([
      getWorkspaceIntegrationSettings(),
      getWorkspaceQualificationSettings(),
    ]);
    return { ok: true, data: { integrations, qualification } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Une erreur inattendue est survenue." };
  }
}
