"use client";

import { Banknote, Save, SlidersHorizontal } from "lucide-react";
import { useActionState } from "react";

import {
  saveQualificationSettings,
  type QualificationSettingsActionState,
} from "@/app/(workspace)/app/settings/actions";
import type { WorkspaceQualificationSettings } from "@/features/workspace/api/workspace";


const initialState: QualificationSettingsActionState = { status: "idle", message: "" };

export function QualificationSettingsPanel({
  organizations,
}: {
  organizations: WorkspaceQualificationSettings[];
}) {
  return (
    <section className="qualification-settings" aria-labelledby="qualification-settings-title">
      <div className="qualification-settings__heading">
        <div><SlidersHorizontal aria-hidden="true" /><span>Qualification commerciale</span></div>
        <strong>Configurable</strong>
      </div>
      <div className="qualification-settings__intro">
        <div>
          <Banknote aria-hidden="true" />
          <div>
            <h2 id="qualification-settings-title">Seuil budgétaire minimum</h2>
            <p>Si le budget maximal déclaré est sous ce montant, le rapport classe le dossier comme non qualifié.</p>
          </div>
        </div>
        <p>Inscrivez <strong>0 $</strong> pour désactiver ce filtre. Ce réglage s’applique aux nouveaux rapports seulement.</p>
      </div>
      {organizations.length > 0 ? (
        <div className="qualification-settings__organizations">
          {organizations.map((organization) => (
            <OrganizationBudgetForm key={organization.organization_id} settings={organization} />
          ))}
        </div>
      ) : (
        <p className="qualification-settings__empty">Aucune organisation n’est encore disponible. Créez une première consultation pour initialiser les réglages.</p>
      )}
      <p className="qualification-settings__note">Le budget demeure une règle MVP simple. Les autres signaux du Blueprint restent visibles dans le brief et les questions recommandées.</p>
    </section>
  );
}

function OrganizationBudgetForm({ settings }: { settings: WorkspaceQualificationSettings }) {
  const action = saveQualificationSettings.bind(null, settings.organization_id);
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className="qualification-settings__form">
      <div>
        <span>Organisation</span>
        <strong>{settings.organization_name}</strong>
      </div>
      <label>
        Montant minimum
        <span className="qualification-settings__input">
          <input
            type="number"
            name="minimum_qualifying_budget_cad"
            min="0"
            max="10000000"
            step="250"
            defaultValue={settings.minimum_qualifying_budget_cad}
            inputMode="numeric"
            required
          />
          <span>$ CA</span>
        </span>
      </label>
      <button type="submit" disabled={pending}>
        <Save aria-hidden="true" />
        {pending ? "Enregistrement…" : "Enregistrer le seuil"}
      </button>
      <p
        className={`qualification-settings__status qualification-settings__status--${state.status}`}
        role="status"
        aria-live="polite"
      >
        {state.message}
      </p>
    </form>
  );
}
