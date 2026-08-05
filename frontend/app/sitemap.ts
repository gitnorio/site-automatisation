import type { MetadataRoute } from "next";

import { articles } from "@/content/articles";
import { siteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/a-propos", "/methodologie", "/blogue", "/contact", "/conditions-utilisation"];
  return [...pages.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : .8 })), ...articles.map((article) => ({ url: `${siteUrl}/blogue/${article.slug}`, lastModified: article.publishedAt, changeFrequency: "monthly" as const, priority: .7 }))];
}

