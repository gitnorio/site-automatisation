import type { MetadataRoute } from "next";

import { articles } from "@/content/articles";
import { services } from "@/content/services";
import { siteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/a-propos", "/methodologie", "/blogue", "/contact", "/conditions-utilisation"];
  return [...pages.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : .8 })), ...services.map((service) => ({ url: `${siteUrl}/services/${service.slug}`, changeFrequency: "monthly" as const, priority: .8 })), ...articles.map((article) => ({ url: `${siteUrl}/blogue/${article.slug}`, lastModified: article.publishedAt, changeFrequency: "monthly" as const, priority: .7 }))];
}
