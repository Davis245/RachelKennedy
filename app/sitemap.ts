import type { MetadataRoute } from "next";

import { getPublishedTrips } from "@/lib/posts/public";
import { getCanonicalUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trips = await getPublishedTrips();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
    },
  ];

  const tripPages: MetadataRoute.Sitemap = trips.map((trip) => ({
    url: getCanonicalUrl(`/trips/${trip.slug}`),
    lastModified: trip.publishedAt ? new Date(trip.publishedAt) : undefined,
  }));

  return [...staticPages, ...tripPages];
}
