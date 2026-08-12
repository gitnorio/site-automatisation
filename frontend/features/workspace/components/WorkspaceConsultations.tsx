import { ArrowRight, CircleDashed, Clock3, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

import type {
  AutomationDeliveryStatus,
  ConsultationStatus,
  QualificationLevel,
  WorkspaceConsultationList,
} from "@/features/workspace/api/workspace";


export function WorkspaceConsultations({ data }: { data: WorkspaceConsultationList }) {
  return (
    <section className="enterprise-page enterprise-page--consultations">
      <div className="enterprise-page__heading">
        <div><span>Opérations</span><h1>Consultations</h1><p>Repérez les dossiers prêts à réviser et ouvrez le contexte complet avant votre prochain échange.</p></div>
        <button type="button" disabled><Plus aria-hidden="true" /> Nouvelle consultation</button>
      </div>
      <div className="enterprise-metrics">
        <Metric label="En cours" value={data.metrics.in_progress} tone="violet" />
        <Metric label="Terminées" value={data.metrics.completed} tone="green" />
        <Metric label="À réviser" value={data.metrics.to_review} tone="coral" />
      </div>
      {data.consultations.length ? (
        <div className="consultation-ledger">
          <div className="consultation-ledger__intro"><div><Sparkles aria-hidden="true" /><span>File de travail</span></div><p>{data.consultations.length} dossier{data.consultations.length > 1 ? "s" : ""} au total</p></div>
          <div className="consultation-ledger__rows">
            {data.consultations.map((consultation) => (
              <Link className="consultation-row" href={`/app/consultations/${consultation.id}`} key={consultation.id}>
                <div className="consultation-row__identity"><span>{shortId(consultation.id)}</span><div><strong>{consultation.primary_goal ?? "Objectif à préciser"}</strong><small>{consultation.organization_name}</small></div></div>
                <div className="consultation-row__progress"><Clock3 aria-hidden="true" /><span>{consultation.question_count} / {consultation.max_questions} questions</span></div>
                <div className="consultation-row__date"><span>{formatDate(consultation.completed_at ?? consultation.created_at)}</span><small>{consultation.completed_at ? "Terminée" : "Créée"}</small></div>
                <div className="consultation-row__labels"><StatusBadge status={consultation.status} />{consultation.qualification ? <QualificationBadge level={consultation.qualification} /> : null}{consultation.automation_status ? <AutomationBadge status={consultation.automation_status} /> : null}</div>
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="enterprise-empty"><CircleDashed aria-hidden="true" /><h2>Aucune consultation pour le moment</h2><p>Les consultations créées apparaîtront ici avec leur progression, leur qualification et leur brief final.</p></div>
      )}
    </section>
  );
}

export function WorkspaceLoadError({ message }: { message: string }) {
  return <section className="enterprise-page"><div className="workspace-error"><CircleDashed aria-hidden="true" /><span>Connexion aux dossiers</span><h1>Les consultations ne peuvent pas être chargées.</h1><p>{message}</p><Link href="/app/consultations">Réessayer <ArrowRight aria-hidden="true" /></Link></div></section>;
}

export function StatusBadge({ status }: { status: ConsultationStatus }) {
  const labels: Record<ConsultationStatus, string> = {
    not_started: "À démarrer",
    in_progress: "En cours",
    completed: "Terminée",
    abandoned: "Interrompue",
  };
  return <span className={`workspace-badge workspace-badge--${status}`}>{labels[status]}</span>;
}

export function QualificationBadge({ level }: { level: QualificationLevel }) {
  const labels: Record<QualificationLevel, string> = {
    priority: "Prioritaire",
    follow_up: "À clarifier",
    unqualified: "Non qualifiée",
  };
  return <span className={`workspace-badge workspace-badge--${level}`}>{labels[level]}</span>;
}

export function AutomationBadge({ status }: { status: AutomationDeliveryStatus }) {
  const labels: Record<AutomationDeliveryStatus, string> = {
    pending: "Activation en attente",
    delivering: "Activation en cours",
    succeeded: "Activation réussie",
    failed: "Activation échouée",
    skipped: "Connecteur à configurer",
  };
  return <span className={`workspace-badge workspace-badge--automation-${status}`}>{labels[status]}</span>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <article data-tone={tone}><span>{label}</span><strong>{value}</strong><small>Dossiers</small></article>;
}

function shortId(id: string): string {
  return `#${id.slice(0, 6).toUpperCase()}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}
