import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/clients", "/tarifs", "/contact"];
  return pages.map((path) => ({ url: `${siteUrl}${path}`, changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : .8 }));
}
