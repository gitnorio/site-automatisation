import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck } from "lucide-react";

import { N8nReveal, WorkflowCanvas } from "@/components/n8n/N8nExperience";
import { categoryLabels, services } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Services d’automatisation et d’intégration IA",
  "Découvrez les services Astrapio pour connecter vos systèmes, automatiser vos opérations et soutenir vos équipes avec l’IA.",
  "/services",
);

export default function ServicesPage() {
  return <main className="n8-services-overview">
    <section className="n8-service-overview-hero">
      <div className="n8-service-overview-hero__glow" />
      <N8nReveal className="n8-service-overview-hero__copy">
        <span className="n8-eyebrow">Services Astrapio</span>
        <h1>Des opérations plus fluides,<br /><em>sans remplacer vos outils.</em></h1>
        <p>Nous concevons des automatisations durables autour de votre réalité : vos systèmes, vos règles et les validations qui doivent rester humaines.</p>
        <div className="n8-button-row"><Link className="n8-button n8-button--primary" href="/contact">Discuter de votre projet <ArrowRight /></Link><a className="n8-button n8-button--ghost" href="#services">Explorer les services</a></div>
      </N8nReveal>
      <N8nReveal delay={120} className="n8-service-overview-hero__visual"><WorkflowCanvas compact /></N8nReveal>
    </section>

    <section className="n8-services-list" id="services">
      <N8nReveal className="n8-section-intro"><span className="n8-eyebrow">Ce que nous construisons</span><h2>Un service précis pour chaque blocage opérationnel.</h2><p>Pas de catalogue générique. Chaque mandat commence par votre processus et se termine par une solution mesurable, intégrée et documentée.</p></N8nReveal>
      <div className="n8-services-list__rows">
        {services.map((service, index) => <N8nReveal delay={(index % 4) * 55} key={service.slug}>
          <Link href={`/services/${service.slug}`} className="n8-service-row">
            <span className="n8-service-row__number">{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{service.title}</h2><p>{service.shortDescription}</p><span>{service.categories.map((category) => categoryLabels[category]).join(" · ")}</span></div>
            <ArrowRight aria-hidden="true" />
          </Link>
        </N8nReveal>)}
      </div>
    </section>

    <section className="n8-services-method">
      <N8nReveal className="n8-services-method__copy"><span className="n8-eyebrow">Une approche responsable</span><h2>La technologie avance. Votre contrôle demeure.</h2><p>Nous séparons clairement les actions automatiques, les exceptions et les décisions qui exigent une approbation.</p><Link className="n8-text-link" href="/methodologie">Voir notre méthodologie <ArrowRight /></Link></N8nReveal>
      <div className="n8-services-method__steps">
        {[{ icon: Compass, title: "Comprendre", text: "Cartographier le processus réel avant de choisir la technologie." }, { icon: CheckCircle2, title: "Valider", text: "Tester les résultats avec les personnes qui font le travail." }, { icon: ShieldCheck, title: "Gouverner", text: "Limiter les accès, tracer les actions et prévoir les exceptions." }].map(({ icon: Icon, title, text }, index) => <N8nReveal delay={index * 80} key={title}><div><Icon /><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div></N8nReveal>)}
      </div>
    </section>
  </main>;
}
