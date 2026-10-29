import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageSeo {
  title: string;
  description: string;
  path: string;
}

/**
 * Builds self-referencing canonical and social metadata for a public page.
 * `metadataBase` in the root layout resolves relative URLs to the canonical host.
 */
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  const url = `${siteConfig.url}${path === "/" ? "" : path}`;
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: socialTitle,
      description,
    },
  };
}
