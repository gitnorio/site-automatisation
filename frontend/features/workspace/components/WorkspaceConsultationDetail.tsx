import { ArrowLeft, Bell, Check, CircleAlert, Clock3, DatabaseZap, FileText, ListChecks, MessageSquareText, RefreshCw, Target, UserRoundCheck, Webhook } from "lucide-react";
import Link from "next/link";

import type {
  WorkspaceAnswer,
  WorkspaceBrief,
  WorkspaceConsultationDetail,
  WorkspaceAutomationDelivery,
  WorkspaceRecommendedQuestion,
} from "@/features/workspace/api/workspace";
import { AutomationBadge, QualificationBadge, StatusBadge } from "@/features/workspace/components/WorkspaceConsultations";
import { FieldTestReviewForm } from "@/features/workspace/components/FieldTestReviewForm";
import { PrintBriefButton } from "@/features/workspace/components/PrintBriefButton";


const objectiveLabels: Record<string, string> = {
  company_profile: "Profil de l’entreprise",
  target_customer: "Clientèle cible",
  positioning_competitors: "Positionnement et concurrence",
  current_channels: "Canaux actuels",
  tools_platforms: "Outils et plateformes",
  previous_agency_experience: "Expérience avec une agence",
  internal_marketing_team: "Équipe marketing interne",
  primary_goal: "Objectif principal",
  trigger_problem: "Élément déclencheur",
  desired_measurable_results: "Résultats mesurables",
  service_sought: "Service recherché",
  budget: "Budget",
  timeline: "Échéancier",
  decision_process: "Processus de décision",
};

const objectiveStateLabels: Record<string, string> = {
  unknown: "Non abordé",
  partial: "Partiel",
  confirmed: "Confirmé",
  contradiction: "À clarifier",
  incomplete: "Incomplet",
};

export function WorkspaceConsultationDetailView({ data }: { data: WorkspaceConsultationDetail }) {
  const title = data.brief?.company.sector ?? `Consultation #${data.id.slice(0, 6).toUpperCase()}`;
  return (
    <section className="enterprise-page enterprise-detail">
      <Link className="enterprise-back" href="/app/consultations"><ArrowLeft aria-hidden="true" /> Toutes les consultations</Link>
      <header className="enterprise-detail__hero">
        <div><span>Préparation de la deuxième entrevue</span><h1>{title}</h1><p>{data.brief?.primary_goal ?? "Le prospect n’a pas encore précisé son objectif principal."}</p></div>
        <div className="enterprise-detail__hero-meta">
          <StatusBadge status={data.status} />
          {data.brief ? <QualificationBadge level={data.brief.qualification.level} /> : null}
          <small>Créée le {formatDate(data.created_at)}</small>
          {data.brief ? <PrintBriefButton /> : null}
        </div>
      </header>

      {data.brief ? (
        <>
          <BriefOverview
            brief={data.brief}
            consultationId={data.id}
            generatedAt={data.completed_at ?? data.created_at}
            organizationName={data.organization_name}
          />
          <PrintBriefSheet
            brief={data.brief}
            consultationId={data.id}
            generatedAt={data.completed_at ?? data.created_at}
            organizationName={data.organization_name}
            title={title}
          />
        </>
      ) : <PendingBrief status={data.status} />}
      <AutomationOverview automations={data.automations} />
      {data.brief ? <FieldTestReviewForm consultationId={data.id} review={data.field_test_review} /> : null}

      <div className="enterprise-detail__columns">
        <section className="workspace-panel workspace-panel--objectives">
          <div className="workspace-panel__heading"><div><Target aria-hidden="true" /><span>Couverture du blueprint</span></div><strong>{data.objectives.filter((objective) => objective.state === "confirmed").length}/{data.objectives.length}</strong></div>
          <div className="objective-list">
            {data.objectives.map((objective) => (
              <article key={objective.key}>
                <span className={`objective-state objective-state--${objective.state}`}>{objective.state === "confirmed" ? <Check aria-hidden="true" /> : null}</span>
                <div><strong>{objectiveLabels[objective.key] ?? objective.key}</strong><p>{answerText(objective.answer, "Aucune réponse enregistrée")}</p></div>
                <span>{objectiveStateLabels[objective.state] ?? objective.state}{objective.required ? " · requis" : " · optionnel"}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="workspace-panel workspace-panel--answers">
          <div className="workspace-panel__heading"><div><MessageSquareText aria-hidden="true" /><span>Réponses brutes</span></div><strong>{data.turns.filter((turn) => turn.answer !== null).length}</strong></div>
          <div className="answer-timeline">
            {data.turns.map((turn) => (
              <article key={turn.id}>
                <span>{turn.number}</span>
                <div><small>{turn.target_objective ? objectiveLabels[turn.target_objective] ?? turn.target_objective : "Question"}</small><h2>{turn.question}</h2><p>{answerText(turn.answer, "Sans réponse")}</p>{turn.answered_at ? <time dateTime={turn.answered_at}>{formatDateTime(turn.answered_at)}</time> : null}</div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function PrintBriefSheet({
  brief,
  consultationId,
  generatedAt,
  organizationName,
  title,
}: {
  brief: WorkspaceBrief;
  consultationId: string;
  generatedAt: string;
  organizationName: string;
  title: string;
}) {
  const attentionItems = [
    ...brief.contradictions.map((item) => `${objectiveLabels[item] ?? item} à clarifier`),
    ...brief.missing_information.map((item) => `${objectiveLabels[item] ?? item} à compléter`),
    ...brief.important_notes,
  ];
  return (
    <article
      className="brief-print-sheet"
      aria-hidden="true"
      data-testid="brief-print-sheet"
    >
      <div className="brief-print-sheet__topline">
        <strong>KOTO / DISCOVERY</strong>
        <span>Préparation de la deuxième entrevue</span>
      </div>

      <header className="brief-print-sheet__header">
        <div>
          <span>Dossier client</span>
          <h1>{title}</h1>
          <p>{brief.primary_goal ?? "Objectif principal à confirmer"}</p>
        </div>
        <dl>
          <div><dt>Préparé pour</dt><dd>{organizationName}</dd></div>
          <div><dt>Dossier</dt><dd>#{consultationId.slice(0, 8).toUpperCase()}</dd></div>
          <div><dt>Généré</dt><dd>{formatDate(generatedAt)}</dd></div>
        </dl>
      </header>

      <section className="brief-print-sheet__summary">
        <div className="brief-print-sheet__summary-main">
          <div className="brief-print-sheet__trigger">
            <span>Élément déclencheur</span>
            <p>{brief.trigger_problem ?? "Aucun élément déclencheur formulé."}</p>
          </div>
          <dl className="brief-print-sheet__facts">
            <PrintFact label="Service recherché" value={brief.service_sought} />
            <PrintFact label="Budget" value={brief.budget} />
            <PrintFact label="Échéancier" value={brief.timeline} />
            <PrintFact label="Clientèle cible" value={brief.company.target_customer} />
          </dl>
        </div>
        <aside>
          <div className={`brief-print-sheet__qualification brief-print-sheet__qualification--${brief.qualification.level}`}>
            <span>Qualification</span>
            <strong>{qualificationLabel(brief.qualification.level)}</strong>
            <p>{brief.qualification.reasons.join(" ")}</p>
          </div>
          <div className="brief-print-sheet__attention">
            <span>Points à valider</span>
            <p>{attentionItems.length ? attentionItems.join(" · ") : "Aucun point obligatoire à clarifier."}</p>
          </div>
        </aside>
      </section>

      <section className="brief-print-sheet__questions">
        <header>
          <div><span>Feuille de conduite</span><h2>Questions recommandées</h2></div>
          <p>{brief.recommended_questions.length} question{brief.recommended_questions.length > 1 ? "s" : ""} pour préciser le mandat</p>
        </header>
        {brief.recommended_questions.length ? (
          <ol>
            {brief.recommended_questions.map((question, index) => (
              <li key={question.topic}>
                <span className="brief-print-sheet__question-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <div className="brief-print-sheet__question-meta">
                    <span>{objectiveLabels[question.topic] ?? question.topic}</span>
                    <strong>{questionPriorityShortLabel(question.priority)}</strong>
                  </div>
                  <h3>{question.question}</h3>
                  <p>{question.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : <p className="brief-print-sheet__questions-empty">Aucune question recommandée pour ce dossier.</p>}
      </section>

      <section className="brief-print-sheet__context">
        <PrintContext label="Canaux actuels" values={brief.current_marketing?.channels ?? []} fallback="Non précisés" />
        <PrintContext label="Outils" values={brief.current_marketing?.tools ?? []} fallback="Non précisés" />
        <PrintContext label="Expérience agence" values={brief.previous_agency_experience ? [brief.previous_agency_experience] : []} fallback="Non précisée" />
        <PrintContext label="Décision" values={brief.decision?.respondent_role ? [brief.decision.respondent_role] : []} fallback="Non précisée" />
      </section>

      <footer className="brief-print-sheet__footer">
        <span>Document de travail confidentiel · usage interne à l’agence</span>
        <strong>1 / 1</strong>
      </footer>
    </article>
  );
}

function PrintFact({ label, value }: { label: string; value: string | null }) {
  return <div><dt>{label}</dt><dd>{value ?? "Non précisé"}</dd></div>;
}

function PrintContext({
  label,
  values,
  fallback,
}: {
  label: string;
  values: string[];
  fallback: string;
}) {
  return <div><span>{label}</span><p>{values.length ? values.join(", ") : fallback}</p></div>;
}

function AutomationOverview({ automations }: { automations: WorkspaceAutomationDelivery[] }) {
  const delivery = automations.at(-1);
  const actionIcons = {
    "crm.upsert": DatabaseZap,
    "owner.assign": UserRoundCheck,
    "team.notify": Bell,
    "webhook.deliver": Webhook,
  };
  if (!delivery) {
    return <section className="automation-panel automation-panel--empty"><RefreshCw aria-hidden="true" /><div><span>Activation</span><h2>En attente du brief final</h2><p>Les actions seront préparées lorsque la consultation sera terminée.</p></div></section>;
  }
  return (
    <section className="automation-panel">
      <div className="automation-panel__heading"><div><Webhook aria-hidden="true" /><span>Activation post-consultation</span></div><AutomationBadge status={delivery.status} /></div>
      <div className="automation-panel__body">
        <div className="automation-actions">
          {delivery.actions.map((action) => {
            const ActionIcon = actionIcons[action as keyof typeof actionIcons] ?? Webhook;
            return <span key={action}><ActionIcon aria-hidden="true" />{automationActionLabel(action)}</span>;
          })}
        </div>
        <div className="automation-attempts">
          <strong>{delivery.connector_name === "disabled" ? "Connecteur pilote désactivé" : `Connecteur ${delivery.connector_name}`}</strong>
          <p>{delivery.status === "skipped" ? "Configurez le webhook serveur pour activer la synchronisation." : `${delivery.attempt_count} tentative${delivery.attempt_count > 1 ? "s" : ""} exécutée${delivery.attempt_count > 1 ? "s" : ""}.`}</p>
          {delivery.attempts.length ? <ol>{delivery.attempts.map((attempt) => <li key={attempt.number}><span>Tentative {attempt.number}</span><small className={`attempt-status attempt-status--${attempt.status}`}>{attempt.status === "succeeded" ? "Réussie" : attempt.status === "failed" ? "Échouée" : "En cours"}{attempt.http_status ? ` · HTTP ${attempt.http_status}` : ""}</small></li>)}</ol> : null}
          {delivery.status === "failed" && delivery.last_error ? <p className="automation-error">Dernière erreur : {delivery.last_error}</p> : null}
        </div>
      </div>
    </section>
  );
}

function BriefOverview({
  brief,
  consultationId,
  generatedAt,
  organizationName,
}: {
  brief: WorkspaceBrief;
  consultationId: string;
  generatedAt: string;
  organizationName: string;
}) {
  const attentionItems = [...brief.missing_information, ...brief.contradictions];
  return (
    <div className="brief-layout">
      <section className="brief-feature">
        <div className="brief-feature__label"><FileText aria-hidden="true" /><span>Fiche de préparation</span></div>
        <h2>{brief.primary_goal ?? "Objectif principal à confirmer"}</h2>
        <p>{brief.trigger_problem ?? "Aucun élément déclencheur n’a été formulé."}</p>
        <dl><BriefField label="Service recherché" value={brief.service_sought} /><BriefField label="Budget" value={brief.budget} /><BriefField label="Échéancier" value={brief.timeline} /><BriefField label="Clientèle cible" value={brief.company.target_customer} /></dl>
        <div className="brief-print-meta">
          <span>Préparé pour {organizationName}</span>
          <span>Dossier #{consultationId.slice(0, 8).toUpperCase()}</span>
          <span>{formatDate(generatedAt)}</span>
        </div>
      </section>
      <aside className="brief-sidebar">
        <div className="brief-qualification"><span>Qualification</span><QualificationBadge level={brief.qualification.level} />{brief.qualification.reasons.map((reason) => <p key={reason}>{reason}</p>)}</div>
        <div className="brief-attention"><div><CircleAlert aria-hidden="true" /><span>À préparer pour l’échange</span></div>{attentionItems.length ? <ul>{attentionItems.map((item) => <li key={item}>{objectiveLabels[item] ?? item}</li>)}</ul> : <p>Aucun point obligatoire à clarifier.</p>}</div>
      </aside>
      <RecommendedQuestions questions={brief.recommended_questions} />
      <section className="brief-context">
        <h2>Contexte opérationnel</h2>
        <div><ContextBlock title="Marketing actuel" values={brief.current_marketing?.channels ?? []} fallback="Aucun canal précisé" /><ContextBlock title="Outils" values={brief.current_marketing?.tools ?? []} fallback="Aucun outil précisé" /><ContextBlock title="Expérience agence" values={brief.previous_agency_experience ? [brief.previous_agency_experience] : []} fallback="Non précisée" /><ContextBlock title="Décision" values={brief.decision?.respondent_role ? [brief.decision.respondent_role] : []} fallback="Processus non précisé" /></div>
      </section>
    </div>
  );
}

function RecommendedQuestions({ questions }: { questions: WorkspaceRecommendedQuestion[] }) {
  return (
    <section className="brief-questions">
      <header>
        <div><ListChecks aria-hidden="true" /><span>Feuille de conduite</span></div>
        <div><h2>Questions recommandées</h2><p>À poser pendant la deuxième entrevue pour préciser le mandat.</p></div>
      </header>
      {questions.length ? (
        <ol>
          {questions.map((question, index) => (
            <li key={question.topic}>
              <span className="brief-question__number">{String(index + 1).padStart(2, "0")}</span>
              <article>
                <div className="brief-question__meta">
                  <span>{objectiveLabels[question.topic] ?? question.topic}</span>
                  <span className={`brief-question__priority brief-question__priority--${question.priority}`}>
                    {questionPriorityLabel(question.priority)}
                  </span>
                </div>
                <h3>{question.question}</h3>
                <p><strong>Pourquoi :</strong> {question.reason}</p>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <p className="brief-questions__empty">Ce dossier existant ne contient pas encore de questions recommandées.</p>
      )}
    </section>
  );
}

function PendingBrief({ status }: { status: WorkspaceConsultationDetail["status"] }) {
  return <div className="brief-pending"><Clock3 aria-hidden="true" /><div><span>Brief en attente</span><h2>{status === "in_progress" ? "La consultation est toujours en cours." : "Aucun brief n’est encore disponible."}</h2><p>Les réponses et la couverture du Blueprint restent visibles plus bas.</p></div></div>;
}

function BriefField({ label, value }: { label: string; value: string | null }) {
  return <div><dt>{label}</dt><dd>{value ?? "Non précisé"}</dd></div>;
}

function ContextBlock({ title, values, fallback }: { title: string; values: string[]; fallback: string }) {
  return <article><span>{title}</span><p>{values.length ? values.join(", ") : fallback}</p></article>;
}

function answerText(answer: WorkspaceAnswer, fallback: string): string {
  if (answer === null) return fallback;
  return Array.isArray(answer) ? answer.join(", ") : String(answer);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function automationActionLabel(action: string): string {
  const labels: Record<string, string> = {
    "crm.upsert": "Créer ou mettre à jour le dossier CRM",
    "owner.assign": "Assigner le bon responsable",
    "team.notify": "Notifier l’équipe",
    "webhook.deliver": "Livrer le webhook signé",
  };
  return labels[action] ?? action;
}

function questionPriorityLabel(priority: WorkspaceRecommendedQuestion["priority"]): string {
  const labels = { high: "Priorité haute", medium: "Priorité moyenne", low: "À approfondir" };
  return labels[priority];
}

function questionPriorityShortLabel(priority: WorkspaceRecommendedQuestion["priority"]): string {
  const labels = { high: "Haute", medium: "Moyenne", low: "Approfondir" };
  return labels[priority];
}

function qualificationLabel(level: WorkspaceBrief["qualification"]["level"]): string {
  const labels = { priority: "Prioritaire", follow_up: "À clarifier", unqualified: "Non qualifié" };
  return labels[level];
}
