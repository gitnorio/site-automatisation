"use client";

import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Database,
  FileText,
  Inbox,
  Link2,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealProps = { children: ReactNode; className?: string; delay?: number };

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -50px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={elementRef} className={`dp-reveal ${visible ? "is-visible" : ""} ${className}`.trim()} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

const typewriterPhrases = [
  "relie vos outils.",
  "traite vos demandes.",
  "prépare la prochaine action.",
] as const;

export function TypewriterLine() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timeout = window.setTimeout(() => setCharacterCount(typewriterPhrases[0].length), 0);
      return () => window.clearTimeout(timeout);
    }
    const phrase = typewriterPhrases[phraseIndex];
    const completed = characterCount >= phrase.length;
    const timeout = window.setTimeout(() => {
      if (completed) {
        setCharacterCount(0);
        setPhraseIndex((current) => (current + 1) % typewriterPhrases.length);
      } else {
        setCharacterCount((current) => current + 1);
      }
    }, completed ? 1800 : 58);
    return () => window.clearTimeout(timeout);
  }, [characterCount, phraseIndex]);

  return <span className="dp-typewriter">Astrapio {typewriterPhrases[phraseIndex].slice(0, characterCount)}<span className="dp-typewriter__cursor" aria-hidden="true" /></span>;
}

export function HeroArchitecture() {
  const visualRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = visualRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = element.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.setProperty("--hero-rotate-y", `${relativeX * 2.8}deg`);
    element.style.setProperty("--hero-rotate-x", `${relativeY * -2.2}deg`);
    element.style.setProperty("--hero-shift-x", `${relativeX * -12}px`);
    element.style.setProperty("--hero-shift-y", `${relativeY * -10}px`);
  }

  function resetPointer() {
    const element = visualRef.current;
    if (!element) return;
    element.style.setProperty("--hero-rotate-y", "0deg");
    element.style.setProperty("--hero-rotate-x", "0deg");
    element.style.setProperty("--hero-shift-x", "0px");
    element.style.setProperty("--hero-shift-y", "0px");
  }

  return <div className="dp-hero-architecture" ref={visualRef} onPointerMove={handlePointerMove} onPointerLeave={resetPointer} aria-hidden="true">
    <div className="dp-hero-architecture__image" style={{ position: "absolute" }}><Image src="/images/editorial/hero-architecture.webp" alt="" fill priority sizes="(max-width: 800px) 100vw, 60vw" /></div>
    <div className="dp-hero-architecture__light" />
  </div>;
}

const demoRequests = [
  { company: "Atelier Nord", request: "Classer les demandes entrantes", channel: "Courriel", status: "Prêt à valider" },
  { company: "Groupe Mercier", request: "Extraire les données du formulaire", channel: "Documents", status: "Données structurées" },
  { company: "Bureau Lavoie", request: "Synchroniser le dossier client", channel: "CRM", status: "Mise à jour préparée" },
] as const;

export function ProductDemo() {
  const [activeRequest, setActiveRequest] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveRequest((current) => (current + 1) % demoRequests.length), 3200);
    return () => window.clearInterval(interval);
  }, [paused]);

  const request = demoRequests[activeRequest];

  return <Reveal className="dp-product-frame" delay={120}>
    <div className="dp-browser-bar"><span /><span /><span /><code>astrapio.ca/espace-de-travail</code></div>
    <div className="dp-product-demo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <aside className="dp-product-sidebar">
        <div className="dp-product-sidebar__brand"><span>A</span><strong>Astrapio</strong></div>
        <nav aria-label="Aperçu de la plateforme">
          <button className="is-active" type="button"><Inbox aria-hidden="true" /> Demandes <b>8</b></button>
          <button type="button"><Workflow aria-hidden="true" /> Automatisations</button>
          <button type="button"><Database aria-hidden="true" /> Données</button>
          <button type="button"><ShieldCheck aria-hidden="true" /> Contrôles</button>
        </nav>
      </aside>
      <div className="dp-product-list">
        <div className="dp-product-list__header"><div><span>Demandes unifiées</span><strong>À traiter aujourd’hui</strong></div><Search aria-hidden="true" /></div>
        {demoRequests.map((item, index) => <button className={index === activeRequest ? "is-active" : ""} type="button" key={item.company} onClick={() => setActiveRequest(index)}>
          <span className="dp-request-icon"><Mail aria-hidden="true" /></span>
          <span><strong>{item.company}</strong><small>{item.request}</small></span>
          <time>{index + 8}:2{index}</time>
        </button>)}
      </div>
      <div className="dp-product-detail" key={request.company}>
        <header><div><span>{request.channel}</span><h3>{request.company}</h3></div><span className="dp-product-detail__state">Analyse terminée</span></header>
        <div className="dp-product-detail__conversation">
          <div className="dp-message dp-message--client"><small>Demande reçue</small><p>{request.request}. Pouvez-vous préparer la prochaine étape?</p></div>
          <div className="dp-message dp-message--assistant"><small><Bot aria-hidden="true" /> Astrapio</small><p>Le contexte autorisé a été vérifié. La demande est structurée et prête pour votre équipe.</p></div>
          <div className="dp-validation"><div><Check aria-hidden="true" /><span><strong>{request.status}</strong><small>Une validation humaine est requise avant l’action finale.</small></span></div><button type="button">Valider <ChevronRight aria-hidden="true" /></button></div>
        </div>
      </div>
    </div>
  </Reveal>;
}

const channels = [
  [Mail, "Courriel", "12 demandes", "Des pièces jointes à traiter"],
  [MessageSquareText, "Formulaires", "7 demandes", "Des champs à vérifier"],
  [Users, "CRM", "5 dossiers", "Des suivis à préparer"],
  [FileText, "Documents", "9 fichiers", "Des données à extraire"],
] as const;

export function ChannelChaos() {
  const [highlighted, setHighlighted] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setHighlighted((current) => (current + 1) % channels.length), 1900);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="dp-channel-map">
    <div className="dp-channel-map__grid" />
    {channels.map(([Icon, title, count, copy], index) => <article className={`dp-channel-card dp-channel-card--${index + 1} ${highlighted === index ? "is-active" : ""}`} key={title}>
      <div><Icon aria-hidden="true" /><span>{title}</span><strong>{count}</strong></div><p>{copy}</p>
    </article>)}
    <svg viewBox="0 0 800 470" aria-hidden="true"><path d="M165 100 C300 100 285 210 385 225" /><path d="M635 100 C500 100 515 210 415 225" /><path d="M165 370 C300 370 285 245 385 235" /><path d="M635 370 C500 370 515 245 415 235" /></svg>
    <div className="dp-channel-hub"><RefreshCw aria-hidden="true" /><strong>28</strong><span>actions dispersées</span></div>
  </div>;
}

const qualificationSteps = ["Demande lue", "Données extraites", "Règles vérifiées", "Action préparée"] as const;

export function QualificationPanel() {
  const [completedSteps, setCompletedSteps] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setCompletedSteps((current) => current >= qualificationSteps.length ? 0 : current + 1), 1200);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="dp-qualification">
    <div className="dp-qualification__header"><div className="dp-qualification__avatar">V</div><div><strong>Demande de Véronique</strong><span>Reçue il y a quelques secondes</span></div></div>
    <div className="dp-qualification__message">Nous avons reçu trois documents. Le dossier doit être créé dans le CRM et assigné à l’équipe des opérations.</div>
    <div className="dp-qualification__versus"><span>Traitement manuel</span><b>comparé à</b><span>Astrapio</span></div>
    <div className="dp-qualification__steps">{qualificationSteps.map((step, index) => <div className={index < completedSteps ? "is-complete" : ""} key={step}><span>{index < completedSteps ? <Check aria-hidden="true" /> : index + 1}</span><strong>{step}</strong><small>{index < completedSteps ? "Terminé" : "En attente"}</small></div>)}</div>
    <div className="dp-qualification__progress"><span style={{ width: `${(completedSteps / qualificationSteps.length) * 100}%` }} /></div>
  </div>;
}

const integrations = ["Microsoft 365", "Outlook", "Teams", "SharePoint", "Google Drive", "HubSpot", "Salesforce", "Slack", "Notion", "Zapier"];

const operationNotifications = [
  "Nouvelle demande classée",
  "Dossier CRM préparé",
  "Exception envoyée à l’équipe",
  "Rapport hebdomadaire généré",
];

export function IntegrationMarquee() {
  const repeated = [...integrations, ...integrations];
  return <div className="dp-marquee" aria-label="Exemples d’intégrations">
    <div className="dp-marquee__fade dp-marquee__fade--left" />
    <div className="dp-marquee__track">{repeated.map((integration, index) => <span key={`${integration}-${index}`}><Link2 aria-hidden="true" />{integration}</span>)}</div>
    <div className="dp-marquee__fade dp-marquee__fade--right" />
  </div>;
}

export function OperationsDashboard() {
  const [notificationIndex, setNotificationIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setNotificationIndex((current) => (current + 1) % operationNotifications.length), 2800);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="dp-operations-dashboard">
    <aside><div className="dp-operations-dashboard__logo">A</div>{[Inbox, Workflow, Database, Users].map((Icon, index) => <span className={index === 0 ? "is-active" : ""} key={index}><Icon aria-hidden="true" /></span>)}</aside>
    <div className="dp-operations-dashboard__inbox"><header><div><small>Bonjour, équipe.</small><h3>Centre d’opérations</h3></div><span>12 actifs</span></header>{["Soumission — Atelier Nord", "Courriel — Groupe Mercier", "Document — Bureau Lavoie", "Synchronisation — Nova"].map((item, index) => <div className={index === notificationIndex ? "is-active" : ""} key={item}><span className="dp-inbox-symbol">{index + 1}</span><p><strong>{item}</strong><small>{index === notificationIndex ? operationNotifications[notificationIndex] : "Traitement automatisé"}</small></p><time>{index + 1} min</time></div>)}</div>
    <div className="dp-operations-dashboard__detail"><div className="dp-operations-dashboard__toolbar"><span>Flux en cours</span><strong>{operationNotifications[notificationIndex]}</strong></div><div className="dp-operations-dashboard__timeline">{["Entrée reçue", "Contexte vérifié", "Données structurées", "Validation humaine", "Action finale"].map((step, index) => <div className={index <= notificationIndex ? "is-complete" : ""} key={step}><span>{index < notificationIndex ? <Check aria-hidden="true" /> : index + 1}</span><p><strong>{step}</strong><small>{index <= notificationIndex ? "Étape documentée" : "À venir"}</small></p></div>)}</div><div className="dp-operations-dashboard__summary"><Sparkles aria-hidden="true" /><p><strong>Une vue claire du travail.</strong><span>Les actions, exceptions et validations restent visibles au même endroit.</span></p></div></div>
  </div>;
}

export function RoiCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(18);
  const [teamSize, setTeamSize] = useState(4);
  const monthlyHours = Math.round(hoursPerWeek * teamSize * 4.33);
  const recoveredHours = Math.round(monthlyHours * 0.64);
  const annualValue = Math.round(recoveredHours * 12 * 42 / 100) * 100;

  return <div className="dp-roi">
    <div className="dp-roi__controls">
      <label><span>Heures répétitives par personne <strong>{hoursPerWeek} h / semaine</strong></span><input type="range" min="4" max="40" value={hoursPerWeek} onChange={(event) => setHoursPerWeek(Number(event.target.value))} /></label>
      <label><span>Personnes concernées <strong>{teamSize}</strong></span><input type="range" min="1" max="20" value={teamSize} onChange={(event) => setTeamSize(Number(event.target.value))} /></label>
      <p>Estimation indicative basée sur un taux d’automatisation prudent de 64 % et un coût horaire chargé de 42 $.</p>
    </div>
    <div className="dp-roi__result">
      <span>Potentiel annuel estimé</span><strong>{annualValue.toLocaleString("fr-CA")} $</strong><p><b>{recoveredHours} heures</b> pourraient être réallouées chaque mois à du travail à plus forte valeur.</p><Link href="/contact">Évaluer votre processus <ArrowRight aria-hidden="true" /></Link>
    </div>
  </div>;
}
