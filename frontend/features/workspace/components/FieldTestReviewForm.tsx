"use client";

import { ClipboardCheck, Eye, Save } from "lucide-react";
import { useActionState } from "react";

import { saveFieldTestReview } from "@/app/(workspace)/app/field-tests/actions";
import type { FieldTestReview } from "@/features/workspace/api/workspace";


const initialState = { status: "idle" as const, message: "" };

export function FieldTestReviewForm({
  consultationId,
  review,
}: {
  consultationId: string;
  review: FieldTestReview | null;
}) {
  const action = saveFieldTestReview.bind(null, consultationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <section className="field-review" aria-labelledby="field-review-title">
      <div className="field-review__heading">
        <div><ClipboardCheck aria-hidden="true" /><span>Revue terrain</span></div>
        <strong>{review ? "Évaluation enregistrée" : "À observer"}</strong>
      </div>
      <form action={formAction}>
        <div className="field-review__intro">
          <div><Eye aria-hidden="true" /><h2 id="field-review-title">Ce brief prépare-t-il vraiment la rencontre?</h2></div>
          <p>Évaluez l’expérience observée et l’utilité du dossier. N’inscrivez aucun renseignement personnel sur le prospect.</p>
        </div>
        <div className="field-review__meta">
          <label>Votre rôle<select name="reviewer_role" defaultValue={review?.reviewer_role ?? "strategist"} required><option value="owner">Direction</option><option value="strategist">Stratégie</option><option value="account_manager">Gestion de compte</option><option value="sales">Développement des affaires</option><option value="other">Autre</option></select></label>
          <BinaryField name="observed_live" label="Consultation observée en direct" value={review?.observed_live ?? null} allowUnknown={false} />
        </div>
        <div className="field-review__criteria">
          <BinaryField name="prospect_understood_without_help" label="Le prospect a compris sans aide" value={review?.prospect_understood_without_help ?? null} />
          <BinaryField name="felt_like_static_form" label="L’expérience ressemblait à un formulaire statique" value={review?.felt_like_static_form ?? null} />
          <BinaryField name="obvious_repetition" label="Une répétition évidente a été observée" value={review?.obvious_repetition ?? null} />
          <BinaryField name="follow_ups_relevant" label="Les questions de suivi étaient pertinentes" value={review?.follow_ups_relevant ?? null} />
          <BinaryField name="guardrail_issue" label="Un conseil, une promesse ou une critique a été généré" value={review?.guardrail_issue ?? null} />
        </div>
        <div className="field-review__scores">
          <RatingField name="brief_usefulness" label="Utilité du brief" value={review?.brief_usefulness ?? 4} />
          <RatingField name="brief_preparedness" label="Préparation de la rencontre" value={review?.brief_preparedness ?? 4} />
          <BinaryField name="agency_would_use" label="L’agence utiliserait ce brief dans son processus" value={review?.agency_would_use ?? null} allowUnknown={false} />
        </div>
        <label className="field-review__notes">Notes d’observation<textarea name="notes" rows={4} maxLength={2000} defaultValue={review?.notes ?? ""} placeholder="Moment de confusion, suivi particulièrement utile, information encore manquante…" /><small>2 000 caractères maximum · aucune donnée personnelle</small></label>
        <div className="field-review__footer">
          <p className={`field-review__status field-review__status--${state.status}`} role="status" aria-live="polite">{state.message}</p>
          <button type="submit" disabled={pending}><Save aria-hidden="true" />{pending ? "Enregistrement…" : review ? "Mettre à jour l’évaluation" : "Enregistrer l’évaluation"}</button>
        </div>
      </form>
    </section>
  );
}

function BinaryField({
  name,
  label,
  value,
  allowUnknown = true,
}: {
  name: string;
  label: string;
  value: boolean | null;
  allowUnknown?: boolean;
}) {
  return <fieldset className="field-review__binary"><legend>{label}</legend><div><Choice name={name} value="true" label="Oui" checked={value === true} /><Choice name={name} value="false" label="Non" checked={value === false} />{allowUnknown ? <Choice name={name} value="unknown" label="Non évalué" checked={value === null} /> : null}</div></fieldset>;
}

function Choice({ name, value, label, checked }: { name: string; value: string; label: string; checked: boolean }) {
  return <label><input type="radio" name={name} value={value} defaultChecked={checked} required /><span>{label}</span></label>;
}

function RatingField({ name, label, value }: { name: string; label: string; value: number }) {
  return <label className="field-review__rating">{label}<select name={name} defaultValue={String(value)} required><option value="1">1 — Inutilisable</option><option value="2">2 — Faible</option><option value="3">3 — Partiel</option><option value="4">4 — Utile</option><option value="5">5 — Excellent</option></select></label>;
}
