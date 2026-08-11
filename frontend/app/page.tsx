import {
  ArrowRight,
  Check,
  CircleCheck,
  FileCheck2,
  Gauge,
  LockKeyhole,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import {
  ChannelChaos,
  HeroArchitecture,
  IntegrationMarquee,
  OperationsDashboard,
  ProductDemo,
  QualificationPanel,
  Reveal,
  RoiCalculator,
  TypewriterLine,
} from "@/components/home/DominiumExperience";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Automatisation intelligente pour PME",
  "Astrapio relie vos outils, automatise les opérations répétitives et garde vos équipes en contrôle.",
  "/",
);

const capabilities = [
  {
    icon: Workflow,
    eyebrow: "Automatiser",
    title: "Des opérations qui avancent sans relance manuelle.",
    description: "Astrapio classe les demandes, extrait les données et prépare la prochaine action selon vos règles.",
    className: "dp-feature-card--wide dp-feature-card--blue",
  },
  {
    icon: MessageSquareText,
    eyebrow: "Assister",
    title: "La bonne information, au bon moment.",
    description: "Vos équipes obtiennent des réponses fondées sur les sources que vous avez approuvées.",
    className: "dp-feature-card--tall",
  },
  {
    icon: Network,
    eyebrow: "Connecter",
    title: "Vos logiciels travaillent enfin ensemble.",
    description: "Courriel, CRM, documents et outils internes partagent un flux cohérent, sans remplacement inutile.",
    className: "",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Contrôler",
    title: "Chaque décision importante reste visible.",
    description: "Les validations humaines, exceptions et journaux d’activité sont intégrés dès la conception.",
    className: "dp-feature-card--dark",
  },
] as const;

const faqs = [
  ["Devons-nous remplacer nos logiciels?", "Non. Nous connectons d’abord les outils que vos équipes utilisent déjà et ne proposons un remplacement que lorsqu’il est réellement justifié."],
  ["Peut-on commencer avec un seul processus?", "Oui. Un pilote court et mesurable permet de confirmer la valeur, les accès et la qualité avant d’étendre l’automatisation."],
  ["Où intervient l’humain?", "Votre équipe conserve la validation des décisions sensibles. Astrapio prépare, documente et signale les exceptions au lieu de les masquer."],
] as const;

export default function HomePage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Astrapio",
    url: siteUrl,
    areaServed: { "@type": "AdministrativeArea", name: "Québec" },
    description: "Conception et intégration d’automatisations intelligentes pour les PME québécoises.",
  };

  return (
    <div className="dp-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <section className="dp-hero">
        <HeroArchitecture />
        <div className="dp-hero__wash" aria-hidden="true" />
        <div className="dp-container dp-hero__content">
          <Reveal className="dp-hero__copy">
            <div className="dp-pill-label"><span /> Automatisation intelligente pour PME</div>
            <h1>Votre entreprise.<br /><em>En mouvement.</em></h1>
            <p className="dp-hero__type"><TypewriterLine /></p>
            <p className="dp-hero__lede">Nous transformons les tâches dispersées en opérations simples, reliées et mesurables — sans remplacer les outils qui fonctionnent déjà.</p>
            <div className="dp-action-row">
              <Link className="dp-button dp-button--primary" href="/contact">Découvrir votre potentiel <ArrowRight aria-hidden="true" /></Link>
              <Link className="dp-button dp-button--ghost" href="/services">Voir les services</Link>
            </div>
            <div className="dp-hero__proof">
              <span><CircleCheck aria-hidden="true" /> Pilote ciblé</span>
              <span><CircleCheck aria-hidden="true" /> Contrôle humain</span>
              <span><CircleCheck aria-hidden="true" /> Données protégées</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="dp-demo-section dp-container" aria-labelledby="demo-title">
        <Reveal className="dp-section-intro dp-section-intro--center">
          <p className="dp-eyebrow">Un espace de travail unifié</p>
          <h2 id="demo-title">Tout ce qui compte.<br />Une seule vue.</h2>
          <p>Suivez les demandes, les validations et les actions automatisées sans perdre le contexte.</p>
        </Reveal>
        <ProductDemo />
      </section>

      <section className="dp-problem-section">
        <div className="dp-container">
          <Reveal className="dp-section-intro dp-section-intro--center">
            <p className="dp-eyebrow">Pourquoi maintenant</p>
            <h2>Vos équipes ne devraient pas<br />servir de pont entre vos outils.</h2>
            <p>Quand l’information voyage par copier-coller, chaque nouveau client ajoute du travail plutôt que de la capacité.</p>
          </Reveal>

          <div className="dp-story-row">
            <Reveal className="dp-story-row__copy">
              <span className="dp-story-number">01</span>
              <h3>Les demandes arrivent de partout.</h3>
              <p>Courriels, formulaires, fichiers et CRM créent des files parallèles. Astrapio les rassemble dans un parcours lisible.</p>
              <ul>
                <li><Check aria-hidden="true" /> Une priorité commune</li>
                <li><Check aria-hidden="true" /> Moins de double saisie</li>
                <li><Check aria-hidden="true" /> Un historique complet</li>
              </ul>
            </Reveal>
            <Reveal className="dp-story-row__visual" delay={120}><ChannelChaos /></Reveal>
          </div>

          <div className="dp-story-row dp-story-row--reverse">
            <Reveal className="dp-story-row__copy">
              <span className="dp-story-number">02</span>
              <h3>Le processus s’exécute, étape par étape.</h3>
              <p>Chaque règle est explicite. Les actions sûres avancent automatiquement; les décisions sensibles reviennent à votre équipe.</p>
              <Link className="dp-text-link" href="/methodologie">Voir notre méthodologie <ArrowRight aria-hidden="true" /></Link>
            </Reveal>
            <Reveal className="dp-story-row__visual" delay={120}><QualificationPanel /></Reveal>
          </div>
        </div>
      </section>

      <section className="dp-capabilities dp-container" aria-labelledby="capabilities-title">
        <Reveal className="dp-section-intro">
          <p className="dp-eyebrow">Une plateforme adaptée à vos opérations</p>
          <h2 id="capabilities-title">Moins d’étapes inutiles.<br />Plus de travail accompli.</h2>
        </Reveal>
        <div className="dp-feature-grid">
          {capabilities.map(({ icon: Icon, eyebrow, title, description, className }, index) => (
            <Reveal className={`dp-feature-card ${className}`} delay={index * 90} key={title}>
              <div className="dp-feature-card__icon"><Icon aria-hidden="true" /></div>
              <div><span>{eyebrow}</span><h3>{title}</h3><p>{description}</p></div>
              <Link href="/services">Explorer <ArrowRight aria-hidden="true" /></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="dp-integrations">
        <div className="dp-container">
          <Reveal className="dp-integrations__heading"><span>Connecté à votre réalité</span><p>Astrapio s’intègre aux outils qui font déjà avancer votre entreprise.</p></Reveal>
        </div>
        <IntegrationMarquee />
      </section>

      <section className="dp-dashboard-section dp-container">
        <Reveal className="dp-section-intro dp-section-intro--center">
          <p className="dp-eyebrow">Le contrôle sans la friction</p>
          <h2>Une opération autonome.<br />Jamais une boîte noire.</h2>
          <p>Voyez ce qui avance, ce qui attend une validation et ce qui mérite votre attention.</p>
        </Reveal>
        <Reveal delay={120}><OperationsDashboard /></Reveal>
      </section>

      <section className="dp-blue-band">
        <div className="dp-container dp-blue-band__grid">
          <Reveal><p className="dp-eyebrow">Conçu pour inspirer confiance</p><h2>L’IA utile commence par des règles claires.</h2></Reveal>
          <Reveal className="dp-blue-band__points" delay={120}>
            <article><LockKeyhole aria-hidden="true" /><strong>Accès maîtrisés</strong><span>Chaque système utilise uniquement les permissions nécessaires.</span></article>
            <article><FileCheck2 aria-hidden="true" /><strong>Actions traçables</strong><span>Les étapes et validations restent documentées.</span></article>
            <article><Gauge aria-hidden="true" /><strong>Résultats mesurés</strong><span>Le pilote suit des objectifs convenus dès le départ.</span></article>
          </Reveal>
        </div>
      </section>

      <section className="dp-roi-section dp-container">
        <Reveal className="dp-section-intro">
          <p className="dp-eyebrow">Estimez l’occasion</p>
          <h2>Combien de temps pourriez-vous rendre à votre équipe?</h2>
          <p>Ajustez les paramètres pour obtenir un premier ordre de grandeur.</p>
        </Reveal>
        <Reveal delay={100}><RoiCalculator /></Reveal>
      </section>

      <section className="dp-faq dp-container">
        <Reveal className="dp-section-intro"><p className="dp-eyebrow">Questions fréquentes</p><h2>Avancer avec les bonnes réponses.</h2></Reveal>
        <Reveal className="dp-faq__list" delay={100}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</Reveal>
      </section>

      <section className="dp-final-cta">
        <div className="dp-final-cta__glow" aria-hidden="true" />
        <div className="dp-container">
          <Reveal className="dp-final-cta__content">
            <div className="dp-final-cta__icon"><Sparkles aria-hidden="true" /></div>
            <p className="dp-eyebrow">Votre prochain gain opérationnel</p>
            <h2>Transformons un processus<br />qui ralentit votre équipe.</h2>
            <p>Une conversation de 30 minutes suffit pour identifier un premier cas d’usage concret.</p>
            <Link className="dp-button dp-button--light" href="/contact">Planifier une discussion <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
