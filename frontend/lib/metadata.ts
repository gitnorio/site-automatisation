import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const canonical = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "fr_CA",
      siteName: "Astrapio",
      title,
      description,
      url: canonical,
    },
  };
}

export { siteUrl };

