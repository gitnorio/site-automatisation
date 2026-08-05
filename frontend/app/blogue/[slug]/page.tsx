import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RetroButton } from "@/components/retro/RetroButton";
import { RetroWindow } from "@/components/retro/RetroWindow";
import { articles, getArticle } from "@/content/articles";
import { getService } from "@/content/services";
import { pageMetadata, siteUrl } from "@/lib/metadata";

export function generateStaticParams() { return articles.map((article) => ({ slug: article.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return article ? pageMetadata(article.title, article.summary, `/blogue/${article.slug}`) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const related = getService(article.relatedService);
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.summary, datePublished: article.publishedAt, author: { "@type": "Organization", name: article.author }, publisher: { "@type": "Organization", name: "Astrapio" }, mainEntityOfPage: `${siteUrl}/blogue/${article.slug}`, inLanguage: "fr-CA" };
  return <article className="page-shell page-stack"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><RetroWindow title={`${article.categoryLabel} — ${article.readingTime}`} headingLevel="h1" controls><div className="hero-grid"><div><Link href="/blogue">← Retour au blogue</Link><h2 className="section-heading" style={{ marginTop: "1rem" }}>{article.title}</h2><p className="section-lede">{article.summary}</p><p>{article.author} · {article.publishedAt}</p></div><div className="pixel-frame"><Image src={article.image} alt={article.imageAlt} width={900} height={600} priority /></div></div></RetroWindow>{article.sections.map((section) => <RetroWindow title={section.heading} key={section.heading}><p className="section-lede">{section.paragraphs.join(" ")}</p>{section.bullets ? <ul className="check-list">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</RetroWindow>)}{related ? <RetroWindow title="Service lié — Prochaine étape"><div className="grid-2"><div><h2 className="section-heading">{related.title}</h2><p className="section-lede">{related.shortDescription}</p></div><div className="button-row"><RetroButton href={`/services?service=${related.slug}`}>Voir la fiche</RetroButton><RetroButton href={`/contact?service=${related.slug}`} variant="primary">Planifier une consultation</RetroButton></div></div></RetroWindow> : null}</article>;
}

