"use client";

import { ArrowRight, Bot, Braces, Check, Database, FileText, Mail, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { IntegrationRail, MouseGlow, N8nReveal, WorkflowCanvas } from "@/components/n8n/N8nExperience";

const workflowTabs = [
  ["Opérations", "Traiter une demande reçue", "De la réception à la validation, chaque étape reste visible."],
  ["Documents", "Extraire et structurer les données", "Les champs incertains sont signalés avant toute écriture."],
  ["Soutien", "Répondre avec le bon contexte", "L’assistant utilise seulement les sources et accès autorisés."],
  ["Intégrations", "Synchroniser les systèmes", "Les changements circulent avec journalisation et reprise sur erreur."],
] as const;

const proofPoints = [
  ["11", "services conçus autour de processus réels"],
  ["7", "étapes de méthode avant l’amélioration continue"],
  ["100 %", "des décisions sensibles peuvent rester humaines"],
] as const;

export function N8nHome() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveTab((current) => (current + 1) % workflowTabs.length), 4200);
    return () => window.clearInterval(interval);
  }, []);

  return <div className="n8-home">
    <section className="n8-hero">
      <div className="n8-hero__ambient" aria-hidden="true" />
      <div className="n8-shell n8-hero__grid">
        <N8nReveal className="n8-hero__copy">
          <p className="n8-kicker">Automatisation et agents IA pour PME</p>
          <h1>Des opérations et des agents IA que vous pouvez <em>voir et contrôler</em></h1>
          <p className="n8-hero__lede">Construisez visuellement, connectez vos outils et gardez chaque décision importante observable. Astrapio déploie dans votre infrastructure ou la nôtre.</p>
          <div className="n8-button-row"><Link className="n8-gradient-button" href="/contact">Démarrer un projet <ArrowRight aria-hidden="true" /></Link><Link className="n8-secondary-button" href="/services">Explorer les services</Link></div>
          <div className="n8-hero__fineprint"><Check aria-hidden="true" /> Projet pilote mesurable <span /><Check aria-hidden="true" /> Contrôle humain intégré</div>
        </N8nReveal>
        <div className="n8-hero__visual" aria-hidden="true"><div className="n8-hero__monogram"><span>A</span><i /></div><div className="n8-hero__spark n8-hero__spark--1" /><div className="n8-hero__spark n8-hero__spark--2" /></div>
      </div>
      <div className="n8-shell n8-trust"><p>Une approche technique adaptée aux environnements de PME utilisant</p><div><span>Microsoft 365</span><span>Google Workspace</span><span>HubSpot</span><span>Salesforce</span><span>SharePoint</span></div></div>
    </section>

    <section className="n8-workflow-showcase">
      <div className="n8-shell n8-workflow-showcase__grid">
        <div className="n8-workflow-tabs">{workflowTabs.map(([team, title, copy], index) => <button className={index === activeTab ? "is-active" : ""} type="button" onClick={() => setActiveTab(index)} key={team}><span>{team}</span><strong>{title}</strong><small>{copy}</small><i /></button>)}</div>
        <N8nReveal delay={100}><WorkflowCanvas /></N8nReveal>
      </div>
      <div className="n8-shell n8-proof-row">{proofPoints.map(([value, copy], index) => <N8nReveal delay={index * 90} key={value}><strong>{value}</strong><span>{copy}</span></N8nReveal>)}</div>
    </section>

    <section className="n8-integrations-section">
      <N8nReveal className="n8-section-heading n8-section-heading--center"><p className="n8-kicker">Connecter sans tout remplacer</p><h2>Branchez l’IA à vos données et à vos outils actuels</h2><span>Des connecteurs standards pour les applications courantes. Des API sur mesure pour le reste.</span></N8nReveal>
      <IntegrationRail />
      <div className="n8-button-center"><Link className="n8-blue-button" href="/services/integration-de-systemes">Découvrir les intégrations</Link></div>
    </section>

    <section className="n8-agents-section n8-shell">
      <N8nReveal className="n8-section-heading n8-section-heading--center"><p className="n8-kicker">Agents IA opérationnels</p><h2>Des agents que votre équipe peut réellement suivre</h2><span>Connectez un modèle, inspectez chaque décision et placez l’humain dans la boucle.</span></N8nReveal>
      <div className="n8-bento">
        <N8nReveal className="n8-bento__large"><MouseGlow><div className="n8-bento__copy"><Bot aria-hidden="true" /><h3>Construire une logique complexe sans boîte noire</h3><p>Combinez modèles, règles, connaissances et outils métier dans un flux lisible. Chaque étape produit un résultat inspectable.</p><Link href="/services/assistants-ia">Explorer les assistants IA →</Link></div><div className="n8-mini-flow"><span><Mail /> Entrée</span><i /><span><Bot /> Agent</span><i /><span><Database /> Outil</span></div></MouseGlow></N8nReveal>
        <N8nReveal delay={100}><MouseGlow><div className="n8-bento__copy"><Users aria-hidden="true" /><h3>Laisser les personnes et les règles guider les décisions</h3><p>Définissez les entrées, sorties, validations et voies d’escalade avant le déploiement.</p></div></MouseGlow></N8nReveal>
        <N8nReveal delay={160}><MouseGlow><div className="n8-bento__copy"><ShieldCheck aria-hidden="true" /><h3>Déployer avec les garde-fous nécessaires</h3><p>Permissions minimales, secrets externalisés, journaux et contrôles adaptés au niveau de risque.</p></div></MouseGlow></N8nReveal>
      </div>
    </section>

    <section className="n8-code-section n8-shell">
      <MouseGlow className="n8-code-panel">
        <N8nReveal className="n8-code-panel__copy"><p className="n8-kicker">Flexibilité technique</p><h2>Du code quand il en faut.<br />Une interface quand il n’en faut pas.</h2><p>Utilisez des règles visuelles pour les opérations courantes et du TypeScript ou Python pour les transformations spécialisées.</p><div><span><Braces aria-hidden="true" /> Logique personnalisée</span><span><Workflow aria-hidden="true" /> Flux visuels</span></div></N8nReveal>
        <div className="n8-code-panel__editor"><div><span>transformer.ts</span><b>Exécuter</b></div><pre><code><i>const</i> dossier = <b>await</b> verifier(demande);{"\n"}<i>if</i> (dossier.confiance &lt; 0.92) {'{'}{"\n"}  <b>return</b> demanderValidation(dossier);{"\n"}{'}'}{"\n"}<b>return</b> synchroniserCRM(dossier);</code></pre><span className="n8-code-panel__pulse"><Sparkles aria-hidden="true" /></span></div>
      </MouseGlow>
    </section>

    <section className="n8-reliability n8-shell">
      <N8nReveal className="n8-section-heading"><p className="n8-kicker">Livrer rapidement, sans fragiliser</p><h2>Avancer vite. Ne rien casser.</h2><span>Des boucles de rétroaction courtes et des contrôles qui rendent les améliorations sûres.</span></N8nReveal>
      <div className="n8-reliability__grid">{[[FileText,"Rejouer une étape", "Tester une transformation sans relancer tout le processus."],[Database,"Utiliser des données simulées", "Valider les cas limites avant de toucher aux systèmes réels."],[ShieldCheck,"Tracer les exceptions", "Comprendre immédiatement où et pourquoi une action s’est arrêtée."]].map(([Icon,title,copy],index)=><N8nReveal delay={index*90} key={String(title)}><MouseGlow><Icon aria-hidden="true" /><h3>{String(title)}</h3><p>{String(copy)}</p></MouseGlow></N8nReveal>)}</div>
    </section>

    <section className="n8-testimonials"><div className="n8-testimonials__track">{["Une vue claire des demandes et des validations.","Une automatisation qui respecte nos logiciels actuels.","Un pilote mesurable avant d’élargir.","Des exceptions visibles plutôt que silencieuses."].map((quote,index)=><blockquote key={quote}><strong>{index%2===0?"Équipe des opérations":"Direction TI"}</strong><p>« {quote} »</p></blockquote>)}</div></section>

    <section className="n8-final-cta"><div className="n8-final-cta__glow" /><N8nReveal><h2>Assez simple pour être compris.<br /><em>Assez puissant pour être déployé.</em></h2><p>Présentez-nous un processus répétitif. Nous identifierons le premier flux à automatiser.</p><div className="n8-button-row"><Link className="n8-gradient-button" href="/contact">Planifier une discussion <ArrowRight aria-hidden="true" /></Link><Link className="n8-secondary-button" href="/methodologie">Voir notre méthode</Link></div></N8nReveal></section>
  </div>;
}
