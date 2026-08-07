"use client";

import { BarChart3, BookOpen, Check, FlaskConical, Rocket, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const tabs = [
  { id: "analyser", label: "Analyser", icon: BarChart3, color: "blue" },
  { id: "prototyper", label: "Prototyper", icon: BookOpen, color: "orange" },
  { id: "tester", label: "Tester", icon: FlaskConical, color: "green" },
  { id: "deployer", label: "Déployer", icon: Rocket, color: "navy" },
] as const;

type TabId = typeof tabs[number]["id"];

const demoContent: Record<TabId, { title: string; progress: string; steps: string[]; rows: [string, string][]; action: string }> = {
  analyser: { title: "Comprendre le processus réel", progress: "25%", steps: ["Observer", "Cartographier", "Choisir", "Mesurer"], rows: [["Déclencheur", "Repéré"], ["Données utiles", "Identifiées"], ["Exceptions", "À documenter"], ["Responsable", "À confirmer"]], action: "Voir la cartographie" },
  prototyper: { title: "Construire un flux limité", progress: "55%", steps: ["Entrée", "Règles", "Action", "Validation"], rows: [["Courriel entrant", "Connecté"], ["Classement", "En essai"], ["Brouillon", "Préparé"], ["Décision finale", "Humaine"]], action: "Examiner le prototype" },
  tester: { title: "Tester les cas qui comptent", progress: "78%", steps: ["Cas courant", "Exception", "Accès", "Reprise"], rows: [["Parcours attendu", "Validé"], ["Donnée manquante", "Signalée"], ["Accès refusé", "Bloqué"], ["Action sensible", "À valider"]], action: "Consulter les scénarios" },
  deployer: { title: "Déployer avec des garde-fous", progress: "100%", steps: ["Accès", "Journal", "Équipe", "Suivi"], rows: [["Permissions", "Limitées"], ["Actions", "Journalisées"], ["Utilisateurs", "Accompagnés"], ["Améliorations", "Planifiées"]], action: "Discuter du déploiement" },
};

export function ProcessDemo() {
  const router = useRouter();
  const [active, setActive] = useState<TabId>("analyser");
  const [paused, setPaused] = useState(false);
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setActive((current) => tabs[(tabs.findIndex((tab) => tab.id === current) + 1) % tabs.length].id);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [paused]);

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(tabs[nextIndex].id);
    tabListRef.current?.querySelectorAll<HTMLButtonElement>("button")[nextIndex]?.focus();
  }

  const content = demoContent[active];
  const color = tabs.find((tab) => tab.id === active)?.color ?? "blue";

  return <section className="process-demo animate-fade-in-up" style={{ animationDelay: ".6s" }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="process-tabs" role="tablist" aria-label="Étapes d’un mandat Astrapio" ref={tabListRef}>
      {tabs.map((tab, index) => { const Icon = tab.icon; const selected = active === tab.id; return <button key={tab.id} role="tab" aria-selected={selected} tabIndex={selected ? 0 : -1} className={selected ? "is-active" : ""} onClick={() => setActive(tab.id)} onKeyDown={(event) => onKeyDown(event, index)}><Icon aria-hidden="true" />{tab.label}</button>; })}
    </div>
    <div className={`demo-canvas demo-canvas--${color}`}>
      <span className="demo-label">Démonstration illustrative</span>
      <div className="system-map" aria-hidden="true">
        <span className="map-node map-node--mail">Courriel</span><span className="map-node map-node--form">Formulaire</span><span className="map-node map-node--erp">ERP</span><span className="map-node map-node--ai">Vérification</span><span className="map-node map-node--crm">CRM</span><span className="map-node map-node--notify">Notification</span>
        <svg viewBox="0 0 1000 420" preserveAspectRatio="none"><path d="M100 115 C240 115 225 175 360 190"/><path d="M115 300 C250 300 250 230 360 220"/><path d="M190 60 C260 60 280 145 360 170"/><path d="M640 200 C730 200 720 115 850 115"/><path d="M640 230 C760 230 725 320 870 320"/></svg>
      </div>
      <div className="demo-dialog animate-fade-in-overlay" key={active} role="tabpanel">
        <div className="demo-dialog__header"><div><span>Exemple de mandat</span><h2>{content.title}</h2></div><ShieldCheck aria-hidden="true" /></div>
        <div className="demo-progress"><div className="demo-progress__steps">{content.steps.map((step, index) => <span className={index <= tabs.findIndex((tab) => tab.id === active) ? "is-complete" : ""} key={step}><i>{index + 1}</i>{step}</span>)}</div><div className="demo-progress__bar"><span style={{ width: content.progress }} /></div><strong>{content.progress}</strong></div>
        <div className="demo-rows">{content.rows.map(([label, status], index) => <div key={label}><span><i>{index + 1}</i>{label}</span><span className="demo-status"><Check aria-hidden="true" />{status}</span></div>)}</div>
        <button type="button" onClick={() => { if (active === "deployer") router.push("/contact"); }}>{content.action}</button>
      </div>
    </div>
  </section>;
}
