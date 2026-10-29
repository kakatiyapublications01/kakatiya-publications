import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const BASE_URL = siteConfig.url;

/**
 * Public, indexable routes only.
 *
 * There are currently no dynamic article or per-issue routes in the App Router
 * (`app/(public)` contains only index pages), so no Firestore-derived URLs are
 * emitted. Add them here once detail routes such as `/stories/[slug]` exist.
 *
 * `lastModified` is intentionally omitted: none of these static pages has a
 * trustworthy per-page modification timestamp, and inventing one (for example
 * `new Date()` at build time) would mislead crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/magazines`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/vvip`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/vip`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
