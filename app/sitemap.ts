import type { MetadataRoute } from "next";

import { getPublishedJourneys } from "@/lib/posts/public";
import { getCanonicalUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journeys = await getPublishedJourneys();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
    },
    {
      url: getCanonicalUrl("/journeys"),
    },
    {
      url: getCanonicalUrl("/about"),
    },
  ];

  const journeyPages: MetadataRoute.Sitemap = journeys.map((journey) => ({
    url: getCanonicalUrl(`/journeys/${journey.slug}`),
    lastModified: journey.publishedAt ? new Date(journey.publishedAt) : undefined,
  }));

  return [...staticPages, ...journeyPages];
}
