import { ArrowRight, Bot, Braces, Cable, FileSearch, LockKeyhole, Repeat2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RetroButton } from "@/components/retro/RetroButton";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Intégration IA pour PME québécoises",
  "Astrapio automatise les opérations, exploite les connaissances et connecte l’intelligence artificielle aux outils déjà utilisés par les PME.",
  "/",
);

const faqs = [
  ["Devons-nous remplacer nos logiciels?", "Non. Nous cherchons d’abord à connecter et à améliorer les outils que vous utilisez déjà."],
  ["Est-ce que l’IA remplacera nos employés?", "L’objectif est de réduire le travail répétitif et d’aider les employés. Les décisions sensibles et les exceptions restent sous contrôle humain."],
  ["Quels types de tâches peuvent être automatisés?", "La saisie, le classement, l’extraction de données, les suivis, la préparation de réponses et la synchronisation sont des exemples fréquents."],
  ["Pouvez-vous travailler avec nos systèmes actuels?", "Nous évaluons les API, permissions et modes d’accès disponibles avant de proposer une intégration réaliste."],
  ["Est-ce possible de réaliser l’intégration à distance?", "Oui, lorsque l’accès, la sécurité et la collaboration peuvent être organisés de façon appropriée."],
  ["Comment sont calculés les coûts d’utilisation de l’IA?", "Ils dépendent notamment du modèle, du volume de données, du nombre de demandes et de l’architecture retenue."],
  ["Combien coûte un projet?", "Le coût varie selon la complexité, les intégrations, le volume d’utilisation et les exigences de sécurité. Une analyse initiale permet de préciser la portée."],
  ["Combien de temps dure une implantation?", "La durée dépend de l’accès aux systèmes, du nombre d’étapes, des essais et des validations requises. Nous privilégions des phases vérifiables."],
  ["Que se passe-t-il après le déploiement?", "Le suivi sert à corriger les cas réels, surveiller l’utilisation et améliorer progressivement la solution."],
  ["Est-ce qu’un projet pilote est possible?", "Oui. Un pilote limité et mesurable est souvent la meilleure façon de valider la valeur et les risques avant d’élargir."],
] as const;

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Astrapio",
    url: siteUrl,
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
    description: "Conception, développement et intégration de solutions d’intelligence artificielle pour les PME québécoises.",
  };

  return (
    <div className="page-shell page-stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <RetroWindow title="Astrapio — Intégration IA" headingLevel="h1" controls>
        <div className="hero-grid">
          <div>
            <div className="eyebrow"><span aria-hidden="true">⚜</span> Solutions technologiques pour les PME du Québec</div>
            <h2 className="hero-title">L’intelligence artificielle, intégrée à votre entreprise.</h2>
            <p className="hero-copy">Astrapio aide les PME québécoises à automatiser leurs opérations, à exploiter leurs connaissances et à connecter l’intelligence artificielle aux outils qu’elles utilisent déjà.</p>
            <div className="button-row">
              <RetroButton href="/contact" variant="primary">Planifier une consultation <ArrowRight size={18} aria-hidden="true" /></RetroButton>
              <RetroButton href="/services">Explorer nos services</RetroButton>
            </div>
          </div>
          <div className="pixel-frame">
            <Image src="/images/pixel-art/hero-ecosystem.webp" alt="Écosystème reliant courriel, documents, CRM, base de données, employés et assistant IA" width={960} height={720} priority />
          </div>
        </div>
      </RetroWindow>

      <RetroWindow title="Le problème — Travail manuel détecté">
        <div className="grid-2">
          <div>
            <h2 className="section-heading">Vos outils sont déjà là. Faisons-les travailler ensemble.</h2>
            <p className="section-lede">Les entreprises possèdent plusieurs logiciels, mais leurs employés doivent encore transférer l’information à la main. Astrapio crée le lien entre vos outils, vos données et l’intelligence artificielle.</p>
          </div>
          <ul className="problem-list inset-panel">
            <li>Recopier des données entre des systèmes.</li><li>Rechercher des documents et procédures.</li><li>Classer des courriels et préparer des réponses.</li><li>Transférer manuellement des informations.</li><li>Produire des rapports répétitifs.</li>
          </ul>
        </div>
      </RetroWindow>

      <RetroWindow title="Services — Accès rapide">
        <div className="grid-4">
          {[
            [Repeat2, "Automatisation intelligente", "Réduire les tâches répétitives et structurer les processus administratifs.", "automatisation"],
            [Bot, "Assistants et connaissances", "Aider les employés à retrouver l’information et préparer leurs prochaines actions.", "assistants-ia"],
            [Cable, "Intégration de systèmes", "Faire circuler les données entre vos outils existants.", "integrations"],
            [Braces, "Développement sur mesure", "Créer une solution adaptée lorsque les produits standards ne suffisent pas.", "sur-mesure"],
          ].map(([Icon, title, copy, category]) => (
            <article className="feature-card" key={String(title)}>
              <Icon className="feature-card__icon" aria-hidden="true" />
              <h3>{String(title)}</h3><p>{String(copy)}</p>
              <Link className="feature-card__link" href={`/services?categorie=${category}`}>Voir les services →</Link>
            </article>
          ))}
        </div>
      </RetroWindow>

      <RetroWindow title="Exemple de flux — Validation humaine activée">
        <div className="workflow" aria-label="Exemple de processus automatisé">
          {["Courriel", "Analyse IA", "Base de données", "CRM", "Notification", "Validation humaine"].map((step, index, array) => (
            <div className="workflow" key={step}><span className="workflow__step">{step}</span>{index < array.length - 1 ? <ArrowRight className="workflow__arrow" aria-hidden="true" /> : null}</div>
          ))}
        </div>
      </RetroWindow>

      <RetroWindow title="Intégrations — Environnement du client">
        <p className="section-lede">Les intégrations sont sélectionnées et développées selon l’environnement de chaque client.</p>
        <div className="tag-cloud" style={{ marginTop: "1.25rem" }}>{["Microsoft 365", "Outlook", "Teams", "SharePoint", "Google Workspace", "Gmail", "Google Drive", "CRM", "ERP", "Bases de données", "API internes", "Logiciels personnalisés"].map((item) => <span className="retro-tag" key={item}>{item}</span>)}</div>
      </RetroWindow>

      <RetroWindow title="Notre méthodologie — 7 étapes">
        <div className="grid-3">
          {["Consultation initiale", "Cartographie", "Évaluation", "Projet pilote", "Intégration", "Déploiement", "Suivi"].map((step, index) => <div className="feature-card" key={step}><strong>{String(index + 1).padStart(2, "0")}</strong><h3>{step}</h3></div>)}
        </div>
        <div className="button-row"><RetroButton href="/methodologie">Voir la méthode complète</RetroButton></div>
      </RetroWindow>

      <RetroWindow title="Pourquoi Astrapio — Une IA adaptée à votre entreprise">
        <div className="grid-2">
          <ul className="check-list"><li>Accompagnement en français.</li><li>Compréhension des réalités des PME québécoises.</li><li>Intégration aux outils existants.</li><li>Développement personnalisé.</li></ul>
          <ul className="check-list"><li>Validation humaine lorsque nécessaire.</li><li>Architecture évolutive.</li><li>Suivi après le déploiement.</li><li>Choix technologiques expliqués clairement.</li></ul>
        </div>
      </RetroWindow>

      <RetroWindow title="Sécurité — Prise en compte dès la conception">
        <div className="grid-3">
          <article className="feature-card"><LockKeyhole className="feature-card__icon" aria-hidden="true" /><h3>Accès limités</h3><p>Permissions définies selon les besoins et séparation logique des données.</p></article>
          <article className="feature-card"><ShieldCheck className="feature-card__icon" aria-hidden="true" /><h3>Secrets protégés</h3><p>Chiffrement en transit, secrets externalisés et journalisation adaptée.</p></article>
          <article className="feature-card"><FileSearch className="feature-card__icon" aria-hidden="true" /><h3>Données minimisées</h3><p>Utiliser seulement les informations nécessaires au fonctionnement choisi.</p></article>
        </div>
      </RetroWindow>

      <RetroWindow title="FAQ — Questions fréquentes">
        <div className="faq-list">{faqs.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </RetroWindow>

      <RetroWindow title="Prochaine étape — Consultation">
        <div className="grid-2">
          <div><h2 className="section-heading">Identifions ce que l’IA peut réellement améliorer.</h2></div>
          <div><p className="section-lede">Présentez-nous un processus répétitif, une difficulté d’intégration ou un besoin d’accès à l’information. Nous évaluerons avec vous la meilleure façon de le simplifier.</p><div className="button-row"><RetroButton href="/contact" variant="primary">Planifier une consultation</RetroButton></div></div>
        </div>
      </RetroWindow>
    </div>
  );
}

