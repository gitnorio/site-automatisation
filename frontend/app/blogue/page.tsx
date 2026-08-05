import Image from "next/image";
import Link from "next/link";

import { RetroWindow } from "@/components/retro/RetroWindow";
import { articles } from "@/content/articles";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export const metadata = pageMetadata("Notre blogue", "Des explications pratiques sur l’automatisation, les assistants IA et l’intégration pour les PME.", "/blogue");

export default function BlogPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "Blog", name: "Blogue Astrapio", url: `${siteUrl}/blogue`, inLanguage: "fr-CA" };
  return <div className="page-shell page-stack"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><RetroWindow title="Notre blogue — IA pratique pour les PME" headingLevel="h1" controls><h2 className="section-heading">Comprendre avant d’automatiser.</h2><p className="section-lede">Des articles accessibles pour évaluer les possibilités, les limites et les bonnes questions à poser avant un projet.</p><div className="tag-cloud" style={{ marginTop: "1.25rem" }}><span className="retro-tag">Automatisation</span><span className="retro-tag">IA pratique</span><span className="retro-tag">Intégration</span></div></RetroWindow><div className="grid-3">{articles.map((article) => <article className="retro-window" key={article.slug}><div className="retro-titlebar"><h2 className="retro-titlebar__title">{article.categoryLabel}</h2></div><div className="pixel-frame"><Image src={article.image} alt={article.imageAlt} width={720} height={480} /></div><div className="retro-window__body"><p className="eyebrow">{article.publishedAt} · {article.readingTime}</p><h2 style={{ marginTop: 0 }}>{article.title}</h2><p>{article.summary}</p><Link className="retro-button" href={`/blogue/${article.slug}`}>Lire l’article →</Link></div></article>)}</div></div>;
}

