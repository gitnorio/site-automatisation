import { N8nHome } from "@/components/home/N8nHome";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Réinventer les opérations des PME",
  "Astrapio conçoit des automatisations intelligentes qui connectent les outils, structurent l’information et accélèrent le travail des PME.",
  "/",
);

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <N8nHome />
    </>
  );
}
