import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedMagazines } from "@/lib/firebase/magazines";
import { getPublishedStories } from "@/lib/firebase/stories";
import { getPublishedVipMembers } from "@/lib/firebase/vip";
import { getPublishedVvipMembers } from "@/lib/firebase/vvip";

const BASE_URL = siteConfig.url;

// Refresh content-derived timestamps hourly without rebuilding the app.
export const revalidate = 3600;

type Timestamped = {
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Returns the newest valid Firestore timestamp in a set of published records.
 * Missing or malformed values are ignored rather than replaced with a build date.
 */
function latestDate(items: Timestamped[]): Date | undefined {
  let latest = 0;

  for (const item of items) {
    for (const value of [item.updatedAt, item.createdAt]) {
      if (!value) continue;
      const time = Date.parse(value);
      if (Number.isFinite(time) && time > latest) {
        latest = time;
      }
    }
  }

  return latest > 0 ? new Date(latest) : undefined;
}

/**
 * Public, indexable routes only.
 *
 * There are currently no dynamic article or per-issue routes in the App Router
 * (`app/(public)` contains only index pages), so no detail-page URLs are
 * emitted. The data accessors below only return records with `status ===
 * "published"` and are already used by the corresponding public pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [magazines, stories, vipMembers, vvipMembers] = await Promise.all([
    getPublishedMagazines(),
    getPublishedStories(),
    getPublishedVipMembers(),
    getPublishedVvipMembers(),
  ]);

  const homepageLastModified = latestDate([
    ...magazines,
    ...stories,
    ...vipMembers,
    ...vvipMembers,
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: homepageLastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/magazines`,
      lastModified: latestDate(magazines),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/stories`,
      lastModified: latestDate(stories),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/vvip`,
      lastModified: latestDate(vvipMembers),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/vip`,
      lastModified: latestDate(vipMembers),
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
