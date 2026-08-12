import { Activity, ArrowRight, CheckCircle2, Clock3, Eye, FlaskConical, MessageSquareText, UsersRound } from "lucide-react";
import Link from "next/link";

import type { FieldTestDashboard as FieldTestDashboardData } from "@/features/workspace/api/workspace";
import { QualificationBadge, StatusBadge } from "@/features/workspace/components/WorkspaceConsultations";


export function FieldTestDashboard({ data }: { data: FieldTestDashboardData }) {
  const { metrics } = data;
  const evidence = [
    ["Compréhension sans aide", metrics.understood_without_help_rate],
    ["Expérience conversationnelle", metrics.conversational_experience_rate],
    ["Aucune répétition", metrics.no_repetition_rate],
    ["Suivis pertinents", metrics.relevant_follow_ups_rate],
    ["Garde-fous respectés", metrics.guardrail_compliance_rate],
  ] as const;
  return (
    <section className="enterprise-page field-lab">
      <header className="field-lab__hero">
        <div><span>Cohorte pilote</span><h1>Carnet de preuves</h1><p>Décidez avec des observations réelles si Koto mérite de passer du MVP à un usage régulier en agence.</p></div>
        <div className="field-lab__sample"><FlaskConical aria-hidden="true" /><span><strong>{metrics.observed_live}</strong>observations en direct</span><span><strong>{metrics.reviewed_briefs}</strong>briefs évalués</span></div>
      </header>

      <div className="field-lab__metrics">
        <FieldMetric icon={UsersRound} label="Démarrage" value={formatRate(metrics.start_rate)} note={`${metrics.started}/${metrics.invitations} invitations`} />
        <FieldMetric icon={CheckCircle2} label="Complétion" value={formatRate(metrics.completion_rate)} note={`${metrics.completed} terminée${metrics.completed === 1 ? "" : "s"}`} />
        <FieldMetric icon={Clock3} label="Durée médiane" value={formatDuration(metrics.median_duration_seconds)} note={`${metrics.average_answered_questions} réponses en moyenne`} />
        <FieldMetric icon={MessageSquareText} label="Briefs utiles" value={formatRate(metrics.useful_brief_rate)} note={metrics.average_brief_usefulness ? `${metrics.average_brief_usefulness}/5 en moyenne` : "Aucune évaluation"} />
      </div>

      <div className="field-lab__evidence">
        <section className="evidence-rail">
          <div className="evidence-rail__heading"><Activity aria-hidden="true" /><div><span>Critères MVP</span><h2>Ce que les observations doivent prouver</h2></div></div>
          <div className="evidence-rail__rows">
            {evidence.map(([label, rate]) => <EvidenceRow key={label} label={label} rate={rate} />)}
          </div>
          <p>Les pourcentages qualitatifs utilisent uniquement les consultations déclarées comme observées en direct.</p>
        </section>
        <aside className="field-lab__decision">
          <Eye aria-hidden="true" /><span>Règle de décision</span><h2>Observer avant d’ajouter.</h2><p>Ne lancez ni documents, ni voix, ni paiement avant d’avoir identifié les échecs récurrents du moteur avec de vrais prospects.</p><dl><div><dt>Abandons</dt><dd>{formatRate(metrics.abandonment_rate)}</dd></div><div><dt>Adoption agence</dt><dd>{formatRate(metrics.agency_adoption_rate)}</dd></div></dl>
        </aside>
      </div>

      <section className="field-cohort">
        <div className="field-cohort__heading"><div><span>Journal de cohorte</span><h2>Une ligne par consultation</h2></div><p>{data.consultations.length} invitation{data.consultations.length === 1 ? "" : "s"}</p></div>
        {data.consultations.length ? <div className="field-cohort__rows">{data.consultations.map((consultation) => <Link href={`/app/consultations/${consultation.id}`} key={consultation.id}><span className="field-cohort__id">#{consultation.id.slice(0, 6).toUpperCase()}</span><div><strong>{consultation.organization_name}</strong><small>{consultation.answered_questions} réponse{consultation.answered_questions === 1 ? "" : "s"} · {formatDuration(consultation.duration_seconds)}</small></div><div className="field-cohort__labels"><StatusBadge status={consultation.status} />{consultation.qualification ? <QualificationBadge level={consultation.qualification} /> : null}</div><span className={`field-review-state ${consultation.review ? "is-reviewed" : ""}`}>{consultation.review ? `${consultation.review.brief_usefulness}/5 · évalué` : "À évaluer"}</span><ArrowRight aria-hidden="true" /></Link>)}</div> : <div className="field-cohort__empty">Créez une première consultation pilote pour commencer la mesure.</div>}
      </section>
    </section>
  );
}

function FieldMetric({ icon: Icon, label, value, note }: { icon: typeof Activity; label: string; value: string; note: string }) {
  return <article><Icon aria-hidden="true" /><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function EvidenceRow({ label, rate }: { label: string; rate: number | null }) {
  return <div><div><strong>{label}</strong><span>{formatRate(rate)}</span></div><progress max={100} value={rate ?? 0} aria-label={`${label} : ${formatRate(rate)}`} /></div>;
}

function formatRate(rate: number | null): string {
  return rate === null ? "—" : `${rate.toLocaleString("fr-CA", { maximumFractionDigits: 1 })} %`;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes} min ${remainingSeconds.toString().padStart(2, "0")}` : `${remainingSeconds} s`;
}
