import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RetroWindow } from "@/components/retro/RetroWindow";
import { articles } from "@/content/articles";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata("Notre blogue", "Des explications pratiques sur l’automatisation, les assistants IA et l’intégration pour les PME.", "/blogue");

export default function BlogPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "Blog", name: "Blogue Astrapio", url: `${siteUrl}/blogue`, inLanguage: "fr-CA" };
  return <div className="page-shell page-stack"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><RetroWindow title="Notre blogue — IA pratique pour les PME" headingLevel="h1" controls><h2 className="section-heading">Comprendre avant d’automatiser.</h2><p className="section-lede">Des articles accessibles pour évaluer les possibilités, les limites et les bonnes questions à poser avant un projet.</p></RetroWindow><div className="grid-3 blog-grid">{articles.map((article) => <article className="retro-window blog-card" key={article.slug}><div className="editorial-image"><Image src={article.image} alt={article.imageAlt} width={720} height={480} /></div><div className="retro-window__body"><p className="eyebrow">{article.categoryLabel} · {article.readingTime}</p><h2>{article.title}</h2><p>{article.summary}</p><Link className="text-link" href={`/blogue/${article.slug}`}>Lire l’article <ArrowRight size={18} aria-hidden="true" /></Link></div></article>)}</div></div>;
}
