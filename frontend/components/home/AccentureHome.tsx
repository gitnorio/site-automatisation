"use client";

import { ArrowLeft, ArrowRight, Check, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealProps = { children: ReactNode; className?: string; delay?: number };

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
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
    }, { threshold: .08, rootMargin: "0px 0px -20px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={elementRef} className={`ac-reveal ${visible ? "is-visible" : ""} ${className}`} style={{ "--ac-delay": `${delay}ms` } as CSSProperties}>{children}</div>;
}

const insights = [
  { type: "AUTOMATISATION", title: "Réduire le travail qui ralentit vos équipes", image: "/images/accenture-inspired/document-flow.webp", theme: "light" },
  { type: "OPÉRATIONS", title: "Connecter les outils que vous utilisez déjà", image: "/images/accenture-inspired/connected-systems.webp", theme: "image" },
  { type: "PERSPECTIVE", title: "L’IA utile commence par un processus clair", image: "", theme: "purple" },
  { type: "MÉTHODE", title: "Passer d’une idée à un pilote mesurable", image: "/images/accenture-inspired/team-collaboration.webp", theme: "image" },
] as const;

const valueSlides = [
  { image: "/images/accenture-inspired/team-collaboration.webp", title: "Rendre du temps aux équipes", copy: "Les tâches répétitives avancent automatiquement. Les personnes se concentrent sur les décisions, les clients et les exceptions." },
  { image: "/images/accenture-inspired/connected-systems.webp", title: "Créer un flux entre les systèmes", copy: "Courriel, documents, CRM et outils internes partagent une même logique sans imposer un remplacement complet." },
  { image: "/images/accenture-inspired/document-flow.webp", title: "Transformer les données en actions", copy: "L’information est extraite, structurée et présentée au bon moment avec les contrôles nécessaires." },
] as const;

const services = [
  ["01", "Automatisation intelligente", "Classer, extraire, synchroniser et préparer les prochaines actions."],
  ["02", "Assistants IA", "Retrouver l’information autorisée et soutenir les équipes dans leur travail."],
  ["03", "Intégration de systèmes", "Faire circuler les données entre vos outils actuels avec une logique fiable."],
  ["04", "Développement sur mesure", "Concevoir les interfaces et mécanismes propres à votre réalité."],
] as const;

export function AccentureHome() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveSlide((current) => (current + 1) % valueSlides.length), 5200);
    return () => window.clearInterval(interval);
  }, [playing]);

  const slide = valueSlides[activeSlide];

  return (
    <div className="ac-home">
      <section className="ac-hero" aria-labelledby="ac-hero-title">
        <h1 className="sr-only" id="ac-hero-title">Réinventez ce que votre entreprise peut accomplir</h1>
        <Link className="ac-hero__link" href="/services">
          <div className="ac-hero__line ac-hero__line--1"><span>RÉINVENTEZ</span><i /></div>
          <div className="ac-hero__line ac-hero__line--2"><span>VOS OPÉRATIONS</span><i /></div>
          <div className="ac-hero__line ac-hero__line--3"><span>POUR AVANCER</span><i /></div>
          <div className="ac-hero__cta">Place au changement <b>›</b></div>
        </Link>
      </section>

      <section className="ac-insights" aria-label="Perspectives Astrapio">
        <div className="ac-insights__track">
          {insights.map((insight, index) => <Reveal className={`ac-insight-card ac-insight-card--${insight.theme}`} delay={index * 100} key={insight.title}>
            {insight.image ? <Image src={insight.image} alt="" fill sizes="(max-width: 700px) 78vw, 22vw" /> : <div className="ac-insight-card__graphic" aria-hidden="true"><span /><span /><span /></div>}
            <div className="ac-insight-card__front"><small>{insight.type}</small><h2>{insight.title}</h2></div>
            <div className="ac-insight-card__back"><p>Une intervention ciblée, des règles explicites et un résultat que votre équipe peut vérifier.</p><span>En savoir plus <b>›</b></span></div>
            <Link href={`/services?service=${index}`} aria-label={`En savoir plus : ${insight.title}`} />
          </Reveal>)}
        </div>
        <div className="ac-scroll-cue"><span /><i /></div>
      </section>

      <section className="ac-value">
        <Reveal className="ac-value__intro">
          <p>VALEUR À 360°</p>
          <h2>Chaque automatisation doit créer un résultat concret pour vos équipes, vos clients et vos opérations.</h2>
        </Reveal>
        <div className="ac-value-carousel">
          <div className="ac-value-carousel__image" key={slide.image}><Image src={slide.image} alt="" fill sizes="(max-width: 800px) 92vw, 45vw" /></div>
          <div className="ac-value-carousel__copy" key={slide.title}><h3>{slide.title}</h3><p>{slide.copy}</p><Link href="/services">Lire la suite <b>›</b></Link></div>
          <div className="ac-value-carousel__controls">
            <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Mettre le carrousel en pause" : "Démarrer le carrousel"}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
            <div><button type="button" onClick={() => setActiveSlide((activeSlide - 1 + valueSlides.length) % valueSlides.length)} aria-label="Diapositive précédente"><ArrowLeft aria-hidden="true" /></button><span>{activeSlide + 1}/{valueSlides.length}</span><button type="button" onClick={() => setActiveSlide((activeSlide + 1) % valueSlides.length)} aria-label="Diapositive suivante"><ArrowRight aria-hidden="true" /></button></div>
          </div>
        </div>
      </section>

      <section className="ac-results">
        <Reveal><h2>DES RÉSULTATS<br />QUI COMPTENT</h2></Reveal>
        <div className="ac-results__grid">
          <Reveal className="ac-result-card ac-result-card--large"><span>64 %</span><h3>du temps répétitif peut être réalloué dans un scénario d’automatisation bien ciblé.</h3></Reveal>
          <Reveal className="ac-result-card ac-result-card--outline" delay={100}><span>01</span><h3>Un processus pilote avant de généraliser.</h3></Reveal>
          <Reveal className="ac-result-card ac-result-card--dark" delay={180}><span>100 %</span><h3>des décisions sensibles peuvent conserver une validation humaine.</h3></Reveal>
        </div>
      </section>

      <section className="ac-services">
        <Reveal className="ac-services__heading"><p>NOS SERVICES</p><h2>Construire le changement, étape par étape.</h2></Reveal>
        <div className="ac-services__list">{services.map(([number, title, copy], index) => <Reveal delay={index * 70} key={title}><Link href="/services"><span>{number}</span><h3>{title}</h3><p>{copy}</p><b>›</b></Link></Reveal>)}</div>
      </section>

      <section className="ac-human">
        <div className="ac-human__image"><Image src="/images/accenture-inspired/team-collaboration.webp" alt="Équipe d’une PME collaborant autour de documents et d’un ordinateur" fill sizes="100vw" /></div>
        <Reveal className="ac-human__copy"><p>UNE TECHNOLOGIE HUMAINE</p><h2>Le meilleur système est celui que votre équipe comprend et utilise.</h2><ul><li><Check aria-hidden="true" /> Des règles visibles</li><li><Check aria-hidden="true" /> Des exceptions prévues</li><li><Check aria-hidden="true" /> Un accompagnement en français</li></ul><Link href="/methodologie">Notre méthodologie <b>›</b></Link></Reveal>
      </section>

      <section className="ac-final">
        <Reveal><p>PRÊT À COMMENCER?</p><h2>RÉINVENTONS<br />UN PROCESSUS.</h2><Link href="/contact">Parler à un expert <b>›</b></Link></Reveal>
      </section>
    </div>
  );
}
