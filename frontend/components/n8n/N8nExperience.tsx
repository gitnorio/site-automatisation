"use client";

import {
  Bot,
  Braces,
  Check,
  Database,
  FileText,
  Mail,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Split,
  Workflow,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealProps = { children: ReactNode; className?: string; delay?: number };

export function N8nReveal({ children, className = "", delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: .08, rootMargin: "0px 0px -35px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={elementRef} className={`n8-reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--n8-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

export function MouseGlow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const panelRef = useRef<HTMLDivElement>(null);

  function moveGlow(event: React.PointerEvent<HTMLDivElement>) {
    const panel = panelRef.current;
    if (!panel) return;
    const bounds = panel.getBoundingClientRect();
    panel.style.setProperty("--mouse-x", `${event.clientX - bounds.left}px`);
    panel.style.setProperty("--mouse-y", `${event.clientY - bounds.top}px`);
  }

  return <div ref={panelRef} className={`n8-mouse-glow ${className}`} onPointerMove={moveGlow}>{children}</div>;
}

const nodeDefinitions = [
  { icon: Mail, label: "Demande reçue", sub: "Courriel", x: 60, y: 178 },
  { icon: Bot, label: "Agent Astrapio", sub: "Analyse et contexte", x: 300, y: 178 },
  { icon: Split, label: "Règle métier", sub: "Cas normal ou exception", x: 560, y: 178 },
  { icon: Database, label: "Système client", sub: "CRM ou base de données", x: 810, y: 92 },
  { icon: Check, label: "Validation", sub: "Contrôle humain", x: 810, y: 265 },
] as const;

export function WorkflowCanvas({ compact = false }: { compact?: boolean }) {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveNode((current) => (current + 1) % nodeDefinitions.length), 1550);
    return () => window.clearInterval(interval);
  }, []);

  return <MouseGlow className={`n8-workflow ${compact ? "n8-workflow--compact" : ""}`}>
    <div className="n8-workflow__toolbar"><span><i /><i /><i /></span><strong>Flux Astrapio</strong><div><span className="is-active">Actif</span><b>Partager</b></div></div>
    <div className="n8-workflow__canvas">
      <div className="n8-workflow__grid" />
      <svg viewBox="0 0 1020 430" aria-hidden="true">
        <path d="M188 215 C230 215 245 215 300 215" />
        <path d="M454 215 C500 215 515 215 560 215" />
        <path d="M710 215 C760 215 765 129 810 129" />
        <path d="M710 215 C760 215 765 302 810 302" />
        <circle cx="300" cy="215" r="4" /><circle cx="560" cy="215" r="4" /><circle cx="810" cy="129" r="4" /><circle cx="810" cy="302" r="4" />
      </svg>
      {nodeDefinitions.map(({ icon: Icon, label, sub, x, y }, index) => <div className={`n8-node ${index === activeNode ? "is-active" : ""}`} style={{ left: `${x / 10.2}%`, top: `${y / 4.3}%` }} key={label}>
        <span><Icon aria-hidden="true" /></span><div><strong>{label}</strong><small>{sub}</small></div><i />
      </div>)}
      <div className="n8-workflow__model n8-workflow__model--1"><Sparkles aria-hidden="true" /><span>Modèle IA</span></div>
      <div className="n8-workflow__model n8-workflow__model--2"><ShieldCheck aria-hidden="true" /><span>Garde-fous</span></div>
    </div>
  </MouseGlow>;
}

const integrations = [
  ["Microsoft 365", "M"], ["Outlook", "O"], ["Teams", "T"], ["SharePoint", "S"],
  ["Google Drive", "G"], ["HubSpot", "H"], ["Salesforce", "S"], ["Slack", "#"],
  ["Notion", "N"], ["Zapier", "Z"], ["API", "{}"], ["SQL", "DB"],
] as const;

export function IntegrationRail() {
  return <div className="n8-integration-rail" aria-label="Exemples d’intégrations">
    <div className="n8-integration-rail__track">{[...integrations, ...integrations].map(([name, mark], index) => <div key={`${name}-${index}`}><span>{mark}</span><small>{name}</small></div>)}</div>
  </div>;
}

export const featureIcons = { Workflow, Bot, RefreshCw, Braces, FileText, MessageSquareText };
