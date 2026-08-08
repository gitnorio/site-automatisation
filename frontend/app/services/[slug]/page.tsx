import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, UserCheck } from "lucide-react";

import { IntegrationRail, MouseGlow, N8nReveal, WorkflowCanvas } from "@/components/n8n/N8nExperience";
import { getService, services } from "@/content/services";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = getService((await params).slug);
  return service ? pageMetadata(service.title, service.shortDescription, `/services/${service.slug}`) : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const index = services.findIndex((item) => item.slug === service.slug);
  const next = services[(index + 1) % services.length];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    provider: { "@type": "ProfessionalService", name: "Astrapio", url: siteUrl },
    areaServed: "Québec",
    url: `${siteUrl}/services/${service.slug}`,
  };

  return <main className="n8-service-detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="n8-service-hero">
      <div className="n8-service-hero__glow" />
      <div className="n8-service-hero__grid">
        <N8nReveal className="n8-service-hero__copy">
          <Link href="/services" className="n8-back-link"><ArrowLeft /> Tous les services</Link>
          <span className="n8-eyebrow">Service {String(index + 1).padStart(2, "0")}</span>
          <h1>{service.title}</h1>
          <p>{service.shortDescription}</p>
          <div className="n8-button-row"><Link className="n8-button n8-button--primary" href={`/contact?service=${service.slug}`}>Évaluer votre besoin <ArrowRight /></Link></div>
        </N8nReveal>
        <N8nReveal delay={100}><WorkflowCanvas compact /></N8nReveal>
      </div>
    </section>

    <section className="n8-service-problem">
      <N8nReveal><span className="n8-eyebrow">Le point de départ</span><h2>Le problème que nous réglons.</h2><p>{service.problem}</p></N8nReveal>
      <N8nReveal delay={90} className="n8-service-problem__facts"><span>Résultats visés</span>{service.benefits.map((benefit) => <div key={benefit}><Check />{benefit}</div>)}</N8nReveal>
    </section>

    <section className="n8-service-flow">
      <N8nReveal className="n8-section-intro"><span className="n8-eyebrow">Fonctionnement</span><h2>Un flux clair, de l’entrée à la validation.</h2><p>Chaque étape est observable, testable et adaptée à vos règles métier.</p></N8nReveal>
      <div className="n8-service-flow__steps">{service.workflow.map((step, stepIndex) => <N8nReveal delay={stepIndex * 80} key={step}><div><span>{String(stepIndex + 1).padStart(2, "0")}</span><h3>{step}</h3><p>{stepIndex === service.workflow.length - 1 ? "Le résultat est livré avec son contexte et les exceptions sont signalées." : "Les données utiles avancent uniquement lorsque les conditions prévues sont satisfaites."}</p></div></N8nReveal>)}</div>
    </section>

    <section className="n8-service-systems">
      <N8nReveal className="n8-section-intro"><span className="n8-eyebrow">Connexions</span><h2>S’intègre aux outils déjà en place.</h2><p>{service.connectableSystems.join(", ")} et d’autres systèmes accessibles par API.</p></N8nReveal>
      <N8nReveal delay={100}><IntegrationRail /></N8nReveal>
    </section>

    <section className="n8-service-controls">
      <N8nReveal className="n8-section-intro"><span className="n8-eyebrow">Confiance et contrôle</span><h2>L’humain intervient là où il apporte de la valeur.</h2></N8nReveal>
      <div className="n8-service-controls__grid">
        <N8nReveal><MouseGlow><UserCheck /><h3>Intervention humaine</h3><p>{service.humanRole}</p></MouseGlow></N8nReveal>
        <N8nReveal delay={90}><MouseGlow><LockKeyhole /><h3>Sécurité intégrée</h3><ul>{service.security.map((item) => <li key={item}><Check />{item}</li>)}</ul></MouseGlow></N8nReveal>
      </div>
    </section>

    <section className="n8-service-next"><N8nReveal><span className="n8-eyebrow">Service suivant</span><Link href={`/services/${next.slug}`}><span>{next.title}</span><ArrowRight /></Link></N8nReveal></section>
  </main>;
}
