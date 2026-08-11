import { HomeHero } from "@/features/marketing/components/HomeHero";
import { HomeSections } from "@/features/marketing/components/HomeSections";
import { KotoMotionController } from "@/features/marketing/components/KotoMotion";
import { ProductJourney } from "@/features/marketing/components/ProductJourney";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Koto — La découverte client orchestrée par l’IA",
  "Koto mène une consultation client adaptative, structure le brief, synchronise votre CRM et déclenche la suite de vos opérations.",
  "/",
);

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
    <HomeHero />
    <ProductJourney />
    <HomeSections />
  </div>;
}
