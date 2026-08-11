import {
  ArrowRight,
  Check,
  CircleCheck,
  Mail,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
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
  siSalesforce,
  siSlack,
  siZapier,
  siZoho,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

import { KotoDemoVideo, KotoMotionController } from "@/components/home/KotoMotion";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Koto — La découverte client orchestrée par l’IA",
  "Koto mène une consultation client adaptative, structure le brief, synchronise votre CRM et déclenche la suite de vos opérations.",
  "/",
);

const stages = [
  {
    label: "Cadrage",
    title: "Définissez le résultat attendu avant le premier échange.",
    description: "Objectifs, critères de qualification et règles de relance deviennent un parcours clair, prêt à être envoyé.",
    visual: "blueprint",
  },
  {
    label: "Invitation",
    title: "Envoyez une expérience qui porte réellement votre marque.",
    description: "Le prospect reçoit par courriel un lien personnel vers une consultation autonome, accessible au moment qui lui convient.",
    visual: "invitation",
  },
  {
    label: "Consultation",
    title: "Ne laissez plus une question importante sans réponse.",
    description: "Koto pose une question principale à la fois, adapte la suite et accepte les réponses, documents et précisions utiles.",
    visual: "consultation",
  },
  {
    label: "Brief",
    title: "Retrouvez les signaux qui comptent, déjà structurés.",
    description: "Chaque réponse confirmée, zone floue et élément à reprendre arrive dans un brief lisible avant votre rencontre.",
    visual: "brief",
  },
  {
    label: "Activation",
    title: "Transformez le contexte recueilli en prochain geste.",
    description: "Les champs autorisés alimentent le CRM, le bon responsable est prévenu et les suivis prévus sont déclenchés.",
    visual: "flow",
  },
] as const;

const integrations: ReadonlyArray<{ name: string; icon: SimpleIcon }> = [
  { name: "Zoho CRM", icon: siZoho },
  { name: "HubSpot", icon: siHubspot },
  { name: "Salesforce", icon: siSalesforce },
  { name: "Google", icon: siGoogle },
  { name: "Gmail", icon: siGmail },
  { name: "Slack", icon: siSlack },
  { name: "Zapier", icon: siZapier },
  { name: "Make", icon: siMake },
  { name: "Airtable", icon: siAirtable },
];

const faqs = [
  ["Koto est-il un simple formulaire?", "Non. Les prochaines questions dépendent des réponses données et des objectifs qu’il reste réellement à clarifier."],
  ["Le prospect voit-il son score de qualification?", "Non. Il voit uniquement sa consultation. Les analyses et signaux internes restent réservés à votre équipe."],
  ["Peut-on utiliser notre propre marque?", "Oui. Le lien, la consultation et les communications peuvent reprendre votre identité visuelle."],
  ["Koto remplace-t-il la rencontre humaine?", "Non. Koto prépare un meilleur premier échange. Votre équipe garde le jugement, la recommandation et la relation."],
  ["Quels outils peut-on connecter?", "Koto se connecte aux CRM, outils de courriel, plateformes collaboratives et systèmes internes accessibles par API."],
] as const;

function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg>;
}

function StageVisual({ type }: { type: (typeof stages)[number]["visual"] }) {
  if (type === "invitation") {
    return <div className="koto-stage-visual koto-invite-visual">
      <div className="koto-mail-window">
        <div className="koto-mail-window__top"><Mail aria-hidden="true" /><span>Nouveau message</span></div>
        <div className="koto-mail-window__field"><small>À</small><span>marie@acme.ca</span></div>
        <div className="koto-mail-window__field"><small>Objet</small><span>Préparons notre échange</span></div>
        <div className="koto-mail-window__body"><Image src="/images/brand/koto-mark.png" alt="" width={34} height={34} /><strong>Votre consultation est prête.</strong><p>Répondez à quelques questions avant notre rencontre.</p><b>Commencer la consultation</b></div>
      </div>
    </div>;
  }

  if (type === "consultation") {
    return <div className="koto-stage-visual koto-stage-visual--screenshot"><Image src="/images/product/consultation-marque-blanche-wall-logo-v6.webp" alt="Consultation en marque blanche présentant une question et des choix de réponse" fill sizes="383px" /></div>;
  }

  if (type === "brief") {
    return <div className="koto-stage-visual koto-brief-visual"><div className="koto-brief-card">
      <div className="koto-brief-card__head"><span>Brief / Acme Inc.</span><b>Prêt pour l’appel</b></div>
      <div className="koto-brief-card__score"><strong>9/11</strong><span>objectifs confirmés</span></div>
      {["Problème déclencheur", "Clientèle cible", "Budget indicatif", "Processus de décision"].map((item, index) => <div className="koto-brief-card__row" key={item}><CircleCheck aria-hidden="true" /><span>{item}</span><small>{index === 2 ? "À clarifier" : "Confirmé"}</small></div>)}
    </div></div>;
  }

  if (type === "flow") {
    return <div className="koto-stage-visual koto-flow-visual"><div className="koto-flow-card">
      <div className="koto-flow-card__source"><Sparkles aria-hidden="true" /><strong>Brief qualifié</strong><span>Acme Inc.</span></div>
      <div className="koto-flow-card__actions"><span><Network aria-hidden="true" /> CRM mis à jour</span><span><MessageSquareText aria-hidden="true" /> Équipe notifiée</span><span><Workflow aria-hidden="true" /> Suivi créé</span></div>
    </div></div>;
  }

  return <div className="koto-stage-visual koto-blueprint-visual"><div className="koto-blueprint-card">
    <div className="koto-blueprint-card__top"><span>Blueprint agence</span><b>Actif</b></div>
    {["Comprendre le déclencheur", "Qualifier le besoin", "Confirmer le budget", "Identifier la décision"].map((item, index) => <div className="koto-blueprint-card__item" key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><Check aria-hidden="true" /></div>)}
  </div></div>;
}

export default function HomePage() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Koto",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Plateforme de découverte client adaptative, de synchronisation CRM et d’automatisation pour agences.",
  };

  return <div className="koto-home">
    <KotoMotionController />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    <section className="koto-hero" aria-labelledby="koto-hero-title">
      <Image className="koto-hero__image" src="/images/editorial/hero-architecture.webp" alt="Architecture contemporaine évoquant un parcours fluide et structuré" fill priority sizes="100vw" />
      <video className="koto-hero__video" autoPlay loop muted playsInline poster="/images/editorial/hero-architecture.webp" aria-hidden="true"><source src="/videos/koto-hero-loop.webm" type="video/webm" /></video>
      <div className="koto-hero__shade" aria-hidden="true" />
      <div className="koto-hero__content"><p className="koto-overline koto-overline--light">Consultation client adaptative</p><h1 id="koto-hero-title">Le contexte qui fait avancer chaque relation client.</h1><p>Koto mène la consultation avant votre appel, structure le brief et transmet les données utiles à vos outils — sans remplacer votre expertise.</p><div className="koto-action-row"><Link className="koto-button koto-button--mint" href="/contact">Demander une démo</Link><Link className="koto-button koto-button--outline" href="#fonctionnement">Explorer le produit</Link></div></div>
      <div className="koto-hero__logos" aria-label="Exemples d’environnements compatibles">{integrations.slice(0, 6).map(({ name, icon }) => <span key={name}><BrandIcon icon={icon} />{name}</span>)}</div>
    </section>

    <section className="koto-system" id="fonctionnement" aria-labelledby="system-title">
      <div className="koto-section-heading koto-section-heading--center" data-koto-reveal><p className="koto-pill-label">Ce que Koto fait</p><h2 id="system-title">Un seul système, de l’invitation au prochain geste.</h2></div>
      <div className="koto-stage-scroll">
        <div className="koto-stage-list">
          {stages.map((stage) => <article className="koto-stage" key={stage.label}><div className="koto-stage__bar">{stage.label}</div><div className="koto-stage__body"><div className="koto-stage__copy"><h3>{stage.title}</h3><p>{stage.description}</p></div><StageVisual type={stage.visual} /></div></article>)}
          <div className="koto-stage-runway" aria-hidden="true" />
        </div>
        <div className="koto-demo-row" data-koto-reveal><KotoDemoVideo /></div>
      </div>
    </section>

    <section className="koto-proof" data-koto-reveal aria-label="Principes de l’expérience Koto"><div className="koto-proof__stats"><div><strong>1</strong><span>question principale à la fois</span></div><div><strong>7 min</strong><span>durée cible de la consultation</span></div></div><div className="koto-proof__quote"><b>Principe produit</b><blockquote>« L’agence définit ce qu’elle veut savoir. Koto décide comment le découvrir. »</blockquote><span>Une délégation contrôlée, avec transition finale vers un humain.</span></div></section>

    <section className="koto-foundation" aria-labelledby="foundation-title"><div className="koto-section-heading koto-section-heading--center" data-koto-reveal><h2 id="foundation-title">La rigueur est une fondation.</h2><Link className="koto-outline-link" href="/contact">Voir une démonstration</Link></div><div className="koto-foundation__grid">
      <article data-koto-reveal><div><h3>Des garde-fous intégrés</h3><p>Le parcours recueille et structure le besoin sans promettre de stratégie, de prix ou de livrable.</p></div><div className="koto-foundation__image"><Image src="/images/product/astrapio-discovery-platform-light-v2.webp" alt="Interface Koto avec progression et garde-fous de consultation" fill sizes="52vw" /></div></article>
      <article data-koto-reveal><div><h3>Des décisions toujours explicables</h3><p>Chaque information conserve sa source et les zones à confirmer restent visibles pour votre équipe.</p></div><div className="koto-evidence-chart" aria-label="Graphique illustrant la qualité croissante du brief"><span>Contexte validé</span><i /><i /><i /><i /><i /><svg viewBox="0 0 500 180" role="img" aria-hidden="true"><path d="M0 170 C80 166 100 150 150 126 S230 110 270 84 S340 76 380 40 S440 36 500 2" fill="none" stroke="currentColor" strokeWidth="3" /></svg></div></article>
    </div></section>

    <section className="koto-stories" id="cas-usage" aria-labelledby="stories-title"><div className="koto-section-heading koto-section-heading--center" data-koto-reveal><h2 id="stories-title">Conçu pour les échanges où le contexte compte.</h2></div><div className="koto-stories__grid">
      <article data-koto-reveal><Image src="/images/editorial/about-team.webp" alt="Équipe de services collaborant autour d’un dossier client" fill sizes="33vw" /><div><b>Services professionnels</b><strong>Un brief plus clair avant de mobiliser les spécialistes.</strong><Link href="/clients">Voir le cas d’usage <ArrowRight aria-hidden="true" /></Link></div></article>
      <article data-koto-reveal><Image src="/images/editorial/methodology-table.webp" alt="Équipe préparant une méthodologie de découverte client" fill sizes="33vw" /><div><b>Agences</b><strong>Une qualification constante, même quand le volume augmente.</strong><Link href="/clients">Voir le cas d’usage <ArrowRight aria-hidden="true" /></Link></div></article>
      <article data-koto-reveal><Image src="/images/editorial/blog-tools.webp" alt="Outils numériques utilisés dans un processus commercial" fill sizes="33vw" /><div><b>Opérations commerciales</b><strong>Le contexte circule sans nouvelle saisie.</strong><Link href="/clients">Voir le cas d’usage <ArrowRight aria-hidden="true" /></Link></div></article>
    </div></section>

    <section className="koto-for" aria-labelledby="koto-for-title" data-koto-reveal><h2 id="koto-for-title">Koto pour</h2><div><strong>Agences marketing</strong><strong>Cabinets-conseils</strong><strong>Équipes de vente</strong><strong>Services B2B</strong></div><p>Préparez chaque premier échange avec le bon contexte. Qualifiez sans rigidité. Connectez le résultat aux outils déjà en place.</p></section>

    <section className="koto-integrations" id="integrations" data-koto-reveal aria-labelledby="integrations-title"><div><h2 id="integrations-title">Vos données client, enfin en mouvement.</h2></div><div><p>Koto est conçu pour synchroniser les données qualifiées avec votre CRM et déclencher des suivis simples dans les outils dont votre équipe dépend.</p><Link className="koto-outline-link" href="/contact">Parler de vos intégrations</Link></div><div className="koto-logo-marquee"><div className="koto-logo-marquee__track">{[...integrations, ...integrations].map(({ name, icon }, index) => <span key={`${name}-${index}`} title={name}><BrandIcon icon={icon} /><small>{name}</small></span>)}</div></div></section>

    <section className="koto-security" id="securite" data-koto-reveal aria-labelledby="security-title"><div className="koto-security__media"><Image src="/images/product/astrapio-discovery-platform-light-v2.webp" alt="Interface Koto sécurisée montrant la progression d’une consultation" fill sizes="50vw" /><span><ShieldCheck aria-hidden="true" /> Garde-fous actifs</span></div><div className="koto-security__copy"><p className="koto-pill-label koto-pill-label--dark">Sécurité</p><h2 id="security-title">Votre sécurité est au cœur de Koto.</h2><p>Le prospect voit uniquement sa consultation. Vos règles, analyses et données internes restent réservées à votre équipe.</p><ul><li><Check aria-hidden="true" /> Accès par lien sécurisé</li><li><Check aria-hidden="true" /> Données internes séparées</li><li><Check aria-hidden="true" /> Décisions traçables</li></ul></div></section>

    <section className="koto-recognition" data-koto-reveal aria-labelledby="recognition-title"><p className="koto-pill-label">Principe fondateur</p><h2 id="recognition-title">« Une bonne consultation ne remplace pas l’expert. Elle lui donne enfin tout le contexte pour bien commencer. »</h2><span>Koto prépare la relation humaine, sans prendre sa place.</span><div className="koto-photo-marquee" aria-hidden="true"><div>{["about-team.webp", "methodology-table.webp", "blog-tools.webp", "about-team.webp", "methodology-table.webp", "blog-tools.webp"].map((image, index) => <Image key={`${image}-${index}`} src={`/images/editorial/${image}`} alt="" width={360} height={210} sizes="280px" />)}</div></div></section>

    <section className="koto-faq" data-koto-reveal aria-labelledby="faq-title"><div><p className="koto-pill-label">FAQ</p><h2 id="faq-title">Questions sur Koto?</h2></div><div className="koto-faq__list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>⌄</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="koto-final-wrap"><div className="koto-final-cta"><h2>Préparez de meilleurs échanges avant même le premier appel.</h2><div className="koto-action-row"><Link className="koto-button koto-button--mint" href="/contact">Demander une démo</Link><Link className="koto-button koto-button--outline" href="#fonctionnement">Explorer le produit</Link></div></div><div className="koto-final-stats"><div><strong>1</strong><span>question principale à la fois</span></div><div><strong>10–14</strong><span>questions au maximum</span></div><div><strong>3</strong><span>issues de qualification</span></div><div><strong>100%</strong><span>du jugement à votre équipe</span></div></div></section>
  </div>;
}
