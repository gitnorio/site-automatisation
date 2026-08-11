"use client";

import {
  ArrowRight,
  Check,
  Database,
  FileText,
  Inbox,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  siAirtable,
  siGmail,
  siGoogle,
  siHubspot,
  siMake,
  siNotion,
  siSalesforce,
  siSlack,
  siZapier,
  siZoho,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";
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
  "qualifie chaque prospect.",
  "synchronise votre CRM.",
  "déclenche le bon suivi.",
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

export function ProductDemo() {
  return <Reveal className="dp-product-frame" delay={120}>
    <div className="dp-browser-bar"><span /><span /><span /><code>app.astrapio.ca/consultation/acme</code></div>
    <div className="dp-product-preview">
      <Image src="/images/product/consultation-marque-blanche-wall-logo-v6.webp" alt="Interface de consultation en marque blanche avec accompagnatrice IA, réponses à choix et enseigne Votre Logo sur le mur" width={3072} height={2048} quality={92} priority sizes="(max-width: 700px) 900px, 1180px" />
      <div className="dp-product-preview__caption"><span>Expérience participant</span><strong>Un parcours confidentiel et guidé, accessible directement depuis le lien reçu par courriel.</strong></div>
    </div>
  </Reveal>;
}

const objectives = [
  [Users, "Entreprise", "Confirmé", "Offre et clientèle comprises"],
  [MessageSquareText, "Déclencheur", "Partiel", "La raison d’agir se précise"],
  [FileText, "Budget", "À confirmer", "Une fourchette reste à obtenir"],
  [ShieldCheck, "Décision", "Confirmé", "Les parties prenantes sont connues"],
] as const;

export function ObjectiveMap() {
  const [highlighted, setHighlighted] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setHighlighted((current) => (current + 1) % objectives.length), 1900);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="dp-channel-map">
    <div className="dp-channel-map__grid" />
    {objectives.map(([Icon, title, count, copy], index) => <article className={`dp-channel-card dp-channel-card--${index + 1} ${highlighted === index ? "is-active" : ""}`} key={title}>
      <div><Icon aria-hidden="true" /><span>{title}</span><strong>{count}</strong></div><p>{copy}</p>
    </article>)}
    <svg viewBox="0 0 800 470" aria-hidden="true"><path d="M165 100 C300 100 285 210 385 225" /><path d="M635 100 C500 100 515 210 415 225" /><path d="M165 370 C300 370 285 245 385 235" /><path d="M635 370 C500 370 515 245 415 235" /></svg>
    <div className="dp-channel-hub"><RefreshCw aria-hidden="true" /><strong>14</strong><span>objectifs suivis</span></div>
  </div>;
}

const qualificationSteps = ["Consultation qualifiée", "Dossier structuré", "CRM synchronisé", "Automatisation lancée"] as const;

export function AutomationFlow() {
  const [completedSteps, setCompletedSteps] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setCompletedSteps((current) => current >= qualificationSteps.length ? 0 : current + 1), 1200);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="dp-qualification">
    <div className="dp-qualification__header"><div className="dp-qualification__avatar">V</div><div><strong>Consultation de Véronique</strong><span>Qualification prioritaire</span></div></div>
    <div className="dp-qualification__message">Le prospect est qualifié. Astrapio prépare le dossier, met à jour le CRM et déclenche le suivi prévu par votre agence.</div>
    <div className="dp-qualification__versus"><span>Consultation terminée</span><b>déclenche</b><span>Vos opérations</span></div>
    <div className="dp-qualification__steps">{qualificationSteps.map((step, index) => <div className={index < completedSteps ? "is-complete" : ""} key={step}><span>{index < completedSteps ? <Check aria-hidden="true" /> : index + 1}</span><strong>{step}</strong><small>{index < completedSteps ? "Terminé" : "En attente"}</small></div>)}</div>
    <div className="dp-qualification__progress"><span style={{ width: `${(completedSteps / qualificationSteps.length) * 100}%` }} /></div>
  </div>;
}

const connectedEnvironments: ReadonlyArray<{ name: string; icon: SimpleIcon }> = [
  { name: "Zoho CRM", icon: siZoho },
  { name: "HubSpot", icon: siHubspot },
  { name: "Salesforce", icon: siSalesforce },
  { name: "Google Workspace", icon: siGoogle },
  { name: "Gmail", icon: siGmail },
  { name: "Slack", icon: siSlack },
  { name: "Zapier", icon: siZapier },
  { name: "Make", icon: siMake },
  { name: "Notion", icon: siNotion },
  { name: "Airtable", icon: siAirtable },
];

const consultationNotifications = [
  "Brief prêt à consulter",
  "Objectif principal confirmé",
  "Budget à clarifier",
  "Consultation interrompue",
];

export function IntegrationMarquee() {
  const repeated = [...connectedEnvironments, ...connectedEnvironments];
  return <div className="dp-marquee" aria-label="Environnements pouvant être connectés à Astrapio">
    <div className="dp-marquee__fade dp-marquee__fade--left" />
    <div className="dp-marquee__track">{repeated.map(({ name, icon }, index) => <span key={`${name}-${index}`}>
      <svg className="dp-integration-logo" viewBox="0 0 24 24" aria-hidden="true" style={{ color: `#${icon.hex}` }}><path d={icon.path} fill="currentColor" /></svg>
      {name}
    </span>)}</div>
    <div className="dp-marquee__fade dp-marquee__fade--right" />
  </div>;
}

export function DiscoveryDashboard() {
  const [notificationIndex, setNotificationIndex] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setNotificationIndex((current) => (current + 1) % consultationNotifications.length), 2800);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="dp-operations-dashboard">
    <aside><div className="dp-operations-dashboard__logo">A</div>{[Inbox, Workflow, Database, Users].map((Icon, index) => <span className={index === 0 ? "is-active" : ""} key={index}><Icon aria-hidden="true" /></span>)}</aside>
    <div className="dp-operations-dashboard__inbox"><header><div><small>Bonjour, équipe.</small><h3>Consultations</h3></div><span>8 actives</span></header>{["Maison Lumen", "Atelier Nord", "Nova Santé", "Studio Boréal"].map((item, index) => <div className={index === notificationIndex ? "is-active" : ""} key={item}><span className="dp-inbox-symbol">{index + 1}</span><p><strong>{item}</strong><small>{index === notificationIndex ? consultationNotifications[notificationIndex] : "Dossier prospect"}</small></p><time>{index + 5} min</time></div>)}</div>
    <div className="dp-operations-dashboard__detail"><div className="dp-operations-dashboard__toolbar"><span>Marketing Discovery Brief</span><strong>{consultationNotifications[notificationIndex]}</strong></div><div className="dp-operations-dashboard__timeline">{["Profil d’entreprise", "Objectif principal", "Problème déclencheur", "Budget et échéancier", "Processus de décision"].map((step, index) => <div className={index <= notificationIndex ? "is-complete" : ""} key={step}><span>{index < notificationIndex ? <Check aria-hidden="true" /> : index + 1}</span><p><strong>{step}</strong><small>{index <= notificationIndex ? "Information confirmée" : "À clarifier"}</small></p></div>)}</div><div className="dp-operations-dashboard__summary"><Sparkles aria-hidden="true" /><p><strong>Prêt pour la conversation humaine.</strong><span>Le contexte confirmé, les manques et les contradictions sont réunis au même endroit.</span></p></div></div>
  </div>;
}

export function ConsultationEstimator() {
  const [requiredObjectives, setRequiredObjectives] = useState(8);
  const [followUps, setFollowUps] = useState(2);
  const questionCount = Math.min(14, requiredObjectives + followUps);
  const estimatedMinutes = Math.max(4, Math.round(questionCount * 0.65));

  return <div className="dp-roi">
    <div className="dp-roi__controls">
      <label><span>Objectifs obligatoires à confirmer <strong>{requiredObjectives}</strong></span><input type="range" min="6" max="10" value={requiredObjectives} onChange={(event) => setRequiredObjectives(Number(event.target.value))} /></label>
      <label><span>Approfondissements nécessaires <strong>{followUps}</strong></span><input type="range" min="0" max="4" value={followUps} onChange={(event) => setFollowUps(Number(event.target.value))} /></label>
      <p>Aperçu illustratif. Le moteur peut éviter une question lorsqu’une réponse couvre déjà plusieurs objectifs.</p>
    </div>
    <div className="dp-roi__result">
      <span>Parcours estimé</span><strong>{questionCount}</strong><p><b>Environ {estimatedMinutes} minutes</b> pour couvrir les objectifs utiles sans dépasser le plafond de 14 questions.</p><Link href="/contact">Concevoir votre Blueprint <ArrowRight aria-hidden="true" /></Link>
    </div>
  </div>;
}
