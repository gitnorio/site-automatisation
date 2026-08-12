"use client";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  abandonConsultation,
  AnswerValue,
  answerConsultation,
  ConsultationQuestion,
  getConsultation,
  PublicConsultation,
  startConsultation,
} from "@/features/consultation/api/consultation";

type ProspectConsultationProps = {
  consultationId: string;
  token?: string;
};

type ActionName = "load" | "start" | "answer" | "abandon" | null;

export function ProspectConsultation({ consultationId, token }: ProspectConsultationProps) {
  const [consultation, setConsultation] = useState<PublicConsultation | null>(null);
  const [action, setAction] = useState<ActionName>(token ? "load" : null);
  const [error, setError] = useState(
    token ? "" : "Ce lien de consultation est incomplet. Demandez un nouveau lien à l’équipe.",
  );
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    void load();

    async function load() {
      try {
        setError("");
        setAction("load");
        setConsultation(await getConsultation(consultationId, token ?? ""));
      } catch (loadError) {
        setError(errorMessage(loadError));
      } finally {
        setAction(null);
      }
    }
  }, [consultationId, token]);

  async function run(
    name: Exclude<ActionName, "load" | null>,
    operation: () => Promise<PublicConsultation>,
  ) {
    try {
      setAction(name);
      setError("");
      setConsultation(await operation());
      setShowExit(false);
    } catch (operationError) {
      setError(errorMessage(operationError));
    } finally {
      setAction(null);
    }
  }

  const organizationName = consultation?.organization_name ?? "Koto";

  return (
    <div className="prospect-experience" data-consultation-id={consultationId}>
      <header className="prospect-header">
        <a className="prospect-brand" href="#main-content" aria-label={`Consultation préparée par ${organizationName}`}>
          <span className="prospect-brand__mark" aria-hidden="true">K</span>
          <span><strong>{organizationName}</strong><small>Propulsé par Koto</small></span>
        </a>
        <span className="prospect-security"><LockKeyhole aria-hidden="true" /> Accès privé</span>
      </header>

      <main className="prospect-main" id="main-content">
        <JourneyThread consultation={consultation} />
        <div className="prospect-stage">
          {action === "load" ? <LoadingCard /> : null}
          {action !== "load" && error && !consultation ? (
            <ErrorCard message={error} onRetry={() => window.location.reload()} />
          ) : null}
          {action !== "load" && consultation?.status === "not_started" ? (
            <WelcomeCard
              organizationName={consultation.organization_name}
              minutes={consultation.estimated_minutes}
              busy={action === "start"}
              error={error}
              onStart={() => token && void run("start", () => startConsultation(consultationId, token))}
            />
          ) : null}
          {action !== "load" && consultation?.status === "in_progress" && consultation.question ? (
            <QuestionCard
              key={consultation.question.turn_id}
              question={consultation.question}
              busy={action === "answer"}
              error={error}
              showExit={showExit}
              onShowExit={setShowExit}
              onAnswer={(answer) => token && void run("answer", () => answerConsultation(
                consultationId,
                token,
                consultation.question?.turn_id ?? "",
                answer,
              ))}
              onAbandon={() => token && void run("abandon", () => abandonConsultation(consultationId, token))}
            />
          ) : null}
          {action !== "load" && consultation && ["completed", "abandoned"].includes(consultation.status) ? (
            <FinishedCard consultation={consultation} />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function JourneyThread({ consultation }: { consultation: PublicConsultation | null }) {
  const questionNumber = consultation?.question?.number ?? 0;
  const activeStep = consultation?.status === "completed" || consultation?.status === "abandoned"
    ? 3
    : questionNumber > 5
      ? 2
      : questionNumber > 0
        ? 1
        : 0;

  return (
    <aside className="prospect-thread" aria-label="Étapes de la consultation">
      <p><Sparkles aria-hidden="true" /> Votre fil de découverte</p>
      <ol>
        {["Se présenter", "Comprendre", "Approfondir", "Préparer l’échange"].map((label, index) => (
          <li className={index <= activeStep ? "is-active" : ""} key={label}>
            <span>{index < activeStep ? <Check aria-hidden="true" /> : index + 1}</span>
            <small>{label}</small>
          </li>
        ))}
      </ol>
      <div className="prospect-thread__note">
        <ShieldCheck aria-hidden="true" />
        <span><strong>Confidentiel</strong>Vos réponses préparent uniquement votre échange.</span>
      </div>
    </aside>
  );
}

function WelcomeCard({
  organizationName,
  minutes,
  busy,
  error,
  onStart,
}: {
  organizationName: string;
  minutes: number;
  busy: boolean;
  error: string;
  onStart: () => void;
}) {
  return (
    <section className="prospect-card prospect-card--welcome">
      <p className="prospect-eyebrow">Consultation de découverte</p>
      <h1>Parlons de votre projet.</h1>
      <p className="prospect-lead">
        Cette conversation interactive aidera {organizationName} à comprendre votre situation avant votre rencontre.
      </p>
      <div className="prospect-time"><Clock3 aria-hidden="true" /><span><strong>Environ {minutes} minutes</strong>Une seule question à la fois, à votre rythme.</span></div>
      <button className="prospect-primary" type="button" onClick={onStart} disabled={busy}>
        {busy ? "Préparation…" : "Commencer"} <ArrowRight aria-hidden="true" />
      </button>
      <StatusMessage message={error} />
    </section>
  );
}

function QuestionCard({
  question,
  busy,
  error,
  showExit,
  onShowExit,
  onAnswer,
  onAbandon,
}: {
  question: ConsultationQuestion;
  busy: boolean;
  error: string;
  showExit: boolean;
  onShowExit: (show: boolean) => void;
  onAnswer: (answer: AnswerValue) => void;
  onAbandon: () => void;
}) {
  const [answer, setAnswer] = useState<AnswerValue>(question.response_type === "multi_choice" ? [] : "");
  const progress = Math.max(4, Math.round((question.number / question.maximum) * 100));
  const valid = isValidAnswer(answer);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (valid && !busy) onAnswer(answer);
  }

  return (
    <section className="prospect-card prospect-card--question">
      <div className="prospect-progress">
        <span>Question {question.number}</span>
        <span>{progress}% du parcours estimé</span>
      </div>
      <progress max={100} value={progress} aria-label={`Progression estimée : ${progress} %`} />
      <p className="prospect-eyebrow">Une question à la fois</p>
      <h1>{question.prompt}</h1>
      <form onSubmit={submit}>
        <AnswerControl question={question} answer={answer} onChange={setAnswer} />
        <div className="prospect-actions">
          <button className="prospect-quiet" type="button" onClick={() => onShowExit(true)}>Terminer plus tard</button>
          <button className="prospect-primary" type="submit" disabled={!valid || busy}>
            {busy ? "Réponse enregistrée…" : "Continuer"} <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </form>
      <StatusMessage message={error} />
      {showExit ? (
        <div className="prospect-exit" role="alertdialog" aria-labelledby="exit-title" aria-describedby="exit-description">
          <button className="prospect-exit__close" type="button" onClick={() => onShowExit(false)} aria-label="Fermer"><X aria-hidden="true" /></button>
          <strong id="exit-title">Terminer la consultation maintenant?</strong>
          <p id="exit-description">Les réponses déjà envoyées resteront enregistrées, mais le parcours sera clôturé.</p>
          <div><button type="button" className="prospect-quiet" onClick={() => onShowExit(false)}>Continuer le parcours</button><button type="button" className="prospect-danger" onClick={onAbandon}>Terminer</button></div>
        </div>
      ) : null}
    </section>
  );
}

function AnswerControl({
  question,
  answer,
  onChange,
}: {
  question: ConsultationQuestion;
  answer: AnswerValue;
  onChange: (answer: AnswerValue) => void;
}) {
  if (question.response_type === "single_choice" || question.response_type === "multi_choice") {
    const selected = Array.isArray(answer) ? answer : [String(answer)];
    const multiple = question.response_type === "multi_choice";
    return (
      <fieldset className="prospect-choices">
        <legend>{multiple ? "Vous pouvez choisir plusieurs réponses." : "Choisissez la réponse la plus juste."}</legend>
        <div>
          {question.choices.map((choice, index) => {
            const checked = selected.includes(choice.value);
            return (
              <label className={checked ? "is-selected" : ""} key={choice.value}>
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name="consultation-answer"
                  value={choice.value}
                  checked={checked}
                  onChange={() => onChange(multiple ? toggleChoice(selected, choice.value) : choice.value)}
                />
                <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>
                <strong>{choice.label}</strong>
                <CheckCircle2 aria-hidden="true" />
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (question.response_type === "text") {
    return <label className="prospect-field">Votre réponse<textarea autoFocus rows={6} value={String(answer)} onChange={(event) => onChange(event.target.value)} placeholder="Expliquez-nous le contexte avec vos propres mots…" /></label>;
  }

  if (question.response_type === "number") {
    return <label className="prospect-field">Votre réponse<input autoFocus type="number" inputMode="numeric" value={String(answer)} onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} placeholder="Ex. 25" /></label>;
  }

  if (question.response_type === "budget_range") {
    return <label className="prospect-field">Fourchette envisagée<input autoFocus type="text" inputMode="decimal" value={String(answer)} onChange={(event) => onChange(event.target.value)} placeholder="Ex. 3 000 $ à 5 000 $ par mois" /><small>Une estimation suffit. Vous pourrez la préciser pendant l’échange.</small></label>;
  }

  return <label className="prospect-field">Échéancier souhaité<input autoFocus type="text" value={String(answer)} onChange={(event) => onChange(event.target.value)} placeholder="Ex. Dans les 6 prochaines semaines" /><small>Indiquez une date, une période ou votre niveau d’urgence.</small></label>;
}

function FinishedCard({ consultation }: { consultation: PublicConsultation }) {
  const interrupted = consultation.status === "abandoned";
  return (
    <section className="prospect-card prospect-card--finished">
      <span className="prospect-finished__icon"><Check aria-hidden="true" /></span>
      <p className="prospect-eyebrow">{interrupted ? "Progression enregistrée" : "Consultation terminée"}</p>
      <h1>{interrupted ? "Merci pour votre temps." : "Merci. Votre échange est maintenant mieux préparé."}</h1>
      <p className="prospect-lead">{consultation.message}</p>
      <div className="prospect-time"><CheckCircle2 aria-hidden="true" /><span><strong>Prochaine étape humaine</strong>L’équipe pourra relire vos réponses avant de vous rencontrer.</span></div>
    </section>
  );
}

function LoadingCard() {
  return <section className="prospect-card prospect-card--loading" aria-live="polite"><span /><span /><span /><p>Préparation de votre consultation…</p></section>;
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <section className="prospect-card prospect-card--error"><RotateCcw aria-hidden="true" /><p className="prospect-eyebrow">Lien indisponible</p><h1>Nous ne pouvons pas ouvrir cette consultation.</h1><p className="prospect-lead">{message}</p><button className="prospect-primary" type="button" onClick={onRetry}>Réessayer</button></section>;
}

function StatusMessage({ message }: { message: string }) {
  return <p className="prospect-status" role="status" aria-live="polite">{message}</p>;
}

function toggleChoice(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((selectedValue) => selectedValue !== value)
    : [...selected, value];
}

function isValidAnswer(answer: AnswerValue): boolean {
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "number") return Number.isFinite(answer);
  return answer.trim().length > 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Une erreur inattendue est survenue. Réessayez dans un instant.";
}
