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
  AutomationFlow,
  ConsultationEstimator,
  DiscoveryDashboard,
  HeroArchitecture,
  ObjectiveMap,
  IntegrationMarquee,
  ProductDemo,
  Reveal,
  TypewriterLine,
} from "@/components/home/DominiumExperience";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Consultation IA, CRM et automatisations pour agences",
  "Astrapio qualifie vos prospects, structure leur brief, synchronise votre CRM et déclenche les automatisations de votre agence.",
  "/",
);

const capabilities = [
  {
    icon: Workflow,
    eyebrow: "Découverte adaptative",
    title: "Votre agence décide ce qu’elle doit apprendre.",
    description: "Définissez les objectifs essentiels à votre découverte client. Astrapio suit leur progression et adapte chaque question au contexte du prospect.",
    className: "dp-feature-card--wide dp-feature-card--blue",
  },
  {
    icon: MessageSquareText,
    eyebrow: "Intégrations CRM",
    title: "Les données utiles rejoignent vos environnements.",
    description: "Connectez Zoho CRM, HubSpot, Salesforce, Pipedrive ou vos outils internes pour éviter la ressaisie après la consultation.",
    className: "dp-feature-card--tall",
  },
  {
    icon: Network,
    eyebrow: "Automatisations",
    title: "Un prospect qualifié peut déclencher la bonne suite.",
    description: "Créez le dossier, assignez un responsable, envoyez une notification ou préparez un suivi selon vos règles.",
    className: "",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Délégation contrôlée",
    title: "L’IA qualifie. Votre équipe conseille.",
    description: "Astrapio ne recommande ni stratégie, ni canal, ni budget. La relation et le jugement restent humains.",
    className: "dp-feature-card--dark",
  },
] as const;

const faqs = [
  ["Est-ce simplement un chatbot?", "Non. La consultation suit un Blueprint précis, maintient l’état de chaque objectif et valide chaque prochaine étape côté serveur."],
  ["Astrapio remplace-t-il notre consultant?", "Non. Astrapio prépare le contexte avant l’échange. Votre équipe conserve l’analyse, les recommandations et la relation client."],
  ["Le prospect reçoit-il une stratégie marketing?", "Non. L’expérience documente le besoin sans recommander de stratégie, de canal, de budget, de prix ou de livrable."],
  ["Combien de temps dure une consultation?", "Le parcours cible environ sept minutes et s’arrête lorsque les informations obligatoires sont suffisamment confirmées."],
  ["Que se passe-t-il si le prospect quitte?", "Les réponses déjà fournies peuvent être conservées et les informations manquantes sont clairement indiquées dans le dossier."],
  ["Quels CRM peut-on connecter?", "Astrapio est conçu pour communiquer avec des environnements comme Zoho CRM, HubSpot, Salesforce, Pipedrive et Microsoft Dynamics, selon les accès disponibles."],
  ["Que peut-on automatiser après la consultation?", "La plateforme peut préparer un dossier, synchroniser les champs autorisés, notifier votre équipe et déclencher un suivi défini par votre agence."],
] as const;

export default function HomePage() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Astrapio Discovery",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Plateforme de consultation IA adaptative, de synchronisation CRM et d’automatisation pour agences marketing.",
  };

  return (
    <div className="dp-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />

      <section className="dp-hero">
        <HeroArchitecture />
        <div className="dp-hero__wash" aria-hidden="true" />
        <div className="dp-container dp-hero__content">
          <Reveal className="dp-hero__copy">
            <div className="dp-pill-label"><span /> Consultation IA pour agences marketing</div>
            <h1>Le bon brief.<br /><em>Avant l’appel.</em></h1>
            <p className="dp-hero__type"><TypewriterLine /></p>
            <p className="dp-hero__lede">Qualifiez chaque prospect dans une consultation guidée, synchronisez les informations utiles avec votre CRM et déclenchez la suite de vos opérations sans ressaisie.</p>
            <div className="dp-action-row">
              <Link className="dp-button dp-button--primary" href="/contact">Demander une démo <ArrowRight aria-hidden="true" /></Link>
              <Link className="dp-button dp-button--ghost" href="#experience">Voir l’expérience</Link>
            </div>
            <div className="dp-hero__proof">
              <span><CircleCheck aria-hidden="true" /> Environ 7 minutes</span>
              <span><CircleCheck aria-hidden="true" /> Questions adaptatives</span>
              <span><CircleCheck aria-hidden="true" /> CRM et automatisations</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="dp-demo-section dp-container" id="experience" aria-labelledby="demo-title">
        <Reveal className="dp-section-intro dp-section-intro--center">
          <p className="dp-eyebrow">Avant la première rencontre</p>
          <h2 id="demo-title">La consultation, le contexte<br />et la qualification en direct.</h2>
          <p>Le prospect répond dans une expérience guidée pendant que les objectifs, la progression et les signaux de qualification se structurent.</p>
        </Reveal>
        <ProductDemo />
      </section>

      <section className="dp-problem-section" id="fonctionnement">
        <div className="dp-container">
          <Reveal className="dp-section-intro dp-section-intro--center">
            <p className="dp-eyebrow">Une vraie découverte</p>
            <h2>Un formulaire collecte des réponses.<br />Astrapio révèle le contexte.</h2>
            <p>La prochaine question dépend de ce que le prospect vient réellement d’expliquer, pas d’un parcours figé à l’avance.</p>
          </Reveal>

          <div className="dp-story-row">
            <Reveal className="dp-story-row__copy">
              <span className="dp-story-number">01</span>
              <h3>Chaque objectif avance séparément.</h3>
              <p>Le moteur suit le profil de l’entreprise, le problème déclencheur, le budget, l’échéancier et le processus de décision sans reposer ce qui est déjà clair.</p>
              <ul>
                <li><Check aria-hidden="true" /> Informations obligatoires suivies</li>
                <li><Check aria-hidden="true" /> Contradictions signalées</li>
                <li><Check aria-hidden="true" /> Relances choisies selon le contexte</li>
              </ul>
            </Reveal>
            <Reveal className="dp-story-row__visual" delay={120}><ObjectiveMap /></Reveal>
          </div>

          <div className="dp-story-row dp-story-row--reverse">
            <Reveal className="dp-story-row__copy">
              <span className="dp-story-number">02</span>
              <h3>Le brief alimente directement vos opérations.</h3>
              <p>Une fois le prospect qualifié, Astrapio prépare le dossier, synchronise votre CRM et déclenche les actions que votre agence a définies.</p>
              <Link className="dp-text-link" href="#brief">Voir le dossier agence <ArrowRight aria-hidden="true" /></Link>
            </Reveal>
            <Reveal className="dp-story-row__visual" delay={120}><AutomationFlow /></Reveal>
          </div>
        </div>
      </section>

      <section className="dp-capabilities dp-container" aria-labelledby="capabilities-title">
        <Reveal className="dp-section-intro">
          <p className="dp-eyebrow">De la découverte à l’action</p>
          <h2 id="capabilities-title">Un seul parcours.<br />Tous vos environnements connectés.</h2>
        </Reveal>
        <div className="dp-feature-grid">
          {capabilities.map(({ icon: Icon, eyebrow, title, description, className }, index) => (
            <Reveal className={`dp-feature-card ${className}`} delay={index * 90} key={title}>
              <div className="dp-feature-card__icon"><Icon aria-hidden="true" /></div>
              <div><span>{eyebrow}</span><h3>{title}</h3><p>{description}</p></div>
              <Link href="/contact">En discuter <ArrowRight aria-hidden="true" /></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="dp-integrations">
        <div className="dp-container">
          <Reveal className="dp-integrations__heading"><span>Connectez tous vos environnements</span><p>CRM, courriel, collaboration et systèmes internes peuvent recevoir les informations qualifiées et poursuivre le travail.</p></Reveal>
        </div>
        <IntegrationMarquee />
      </section>

      <section className="dp-dashboard-section dp-container" id="brief">
        <Reveal className="dp-section-intro dp-section-intro--center">
          <p className="dp-eyebrow">Après la consultation</p>
          <h2>Le contexte important.<br />Sans relire toute la conversation.</h2>
          <p>Votre équipe voit ce qui est confirmé, ce qui manque et ce qui mérite d’être clarifié pendant la rencontre.</p>
        </Reveal>
        <Reveal delay={120}><DiscoveryDashboard /></Reveal>
      </section>

      <section className="dp-blue-band" id="garde-fous">
        <div className="dp-container dp-blue-band__grid">
          <Reveal><p className="dp-eyebrow">Une délégation contrôlée</p><h2>L’IA pose les questions. Vous gardez le jugement.</h2></Reveal>
          <Reveal className="dp-blue-band__points" delay={120}>
            <article><LockKeyhole aria-hidden="true" /><strong>Backend autoritaire</strong><span>L’état, les transitions et la fin de consultation sont validés par des règles serveur.</span></article>
            <article><FileCheck2 aria-hidden="true" /><strong>Sorties structurées</strong><span>Chaque extraction et décision respecte un contrat strict avant d’être utilisée.</span></article>
            <article><Gauge aria-hidden="true" /><strong>Périmètre clair</strong><span>Aucun conseil, prix, délai ou engagement n’est formulé au prospect.</span></article>
          </Reveal>
        </div>
      </section>

      <section className="dp-roi-section dp-container">
        <Reveal className="dp-section-intro">
          <p className="dp-eyebrow">Un parcours volontairement court</p>
          <h2>Assez de contexte.<br />Pas une question de trop.</h2>
          <p>Explorez comment les objectifs obligatoires et les approfondissements influencent la longueur d’une consultation.</p>
        </Reveal>
        <Reveal delay={100}><ConsultationEstimator /></Reveal>
      </section>

      <section className="dp-faq dp-container">
        <Reveal className="dp-section-intro"><p className="dp-eyebrow">Questions fréquentes</p><h2>Une IA qui prépare la relation. Elle ne la remplace pas.</h2></Reveal>
        <Reveal className="dp-faq__list" delay={100}>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</Reveal>
      </section>

      <section className="dp-final-cta">
        <div className="dp-final-cta__glow" aria-hidden="true" />
        <div className="dp-container">
          <Reveal className="dp-final-cta__content">
            <div className="dp-final-cta__icon"><Sparkles aria-hidden="true" /></div>
            <p className="dp-eyebrow">Préparez mieux le premier échange</p>
            <h2>Votre prochaine découverte client peut commencer avant l’appel.</h2>
            <p>Présentez-nous votre processus actuel. Nous vous montrerons comment relier consultation, CRM et automatisations dans un même parcours.</p>
            <Link className="dp-button dp-button--light" href="/contact">Demander une démo <ArrowRight aria-hidden="true" /></Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
