import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatTripPlace, getTripFilters, getPublishedTrips } from "@/lib/posts/public";
import { getCanonicalUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trips",
  description: "Browse Rachel Kennedy’s published travel stories by destination.",
  alternates: {
    canonical: getCanonicalUrl("/trips"),
  },
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function createFilterHref(filters: { country?: string; location?: string }) {
  const searchParams = new URLSearchParams();

  if (filters.country) {
    searchParams.set("country", filters.country);
  }

  if (filters.location) {
    searchParams.set("location", filters.location);
  }

  const query = searchParams.toString();
  return query ? `/trips?${query}` : "/trips";
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string | string[]; location?: string | string[] }>;
}) {
  const [resolvedSearchParams, publishedTrips] = await Promise.all([searchParams, getPublishedTrips()]);
  const country = getSingleSearchParam(resolvedSearchParams.country);
  const location = getSingleSearchParam(resolvedSearchParams.location);
  const filters = getTripFilters(publishedTrips);
  const filteredTrips = publishedTrips.filter((trip) => {
    if (country && trip.country !== country) {
      return false;
    }

    if (location && trip.location !== location) {
      return false;
    }

    return true;
  });
  const hasActiveFilters = Boolean(country || location);

  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="space-y-10">
        <AccentPill tone="blue">Trips</AccentPill>
        <SectionHeading eyebrow="Stories by destination" title="Published travel stories" />
        <p className="max-w-2xl text-[var(--color-muted)]">
          Browse Rachel’s published travel writing by destination, then open each trip for the full story and
          gallery.
        </p>

        {publishedTrips.length > 0 ? (
          <section className="space-y-6" aria-labelledby="trip-filters-heading">
            <div className="space-y-3">
              <h2 id="trip-filters-heading" className="text-2xl uppercase">
                Filter trips
              </h2>
              <div className="space-y-4">
                {filters.countries.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Country
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={createFilterHref({ location })}
                        className={`inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
                          !country
                            ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                            : "border-[var(--color-border)] bg-white"
                        }`}
                      >
                        All countries
                      </Link>
                      {filters.countries.map((filterCountry) => (
                        <Link
                          key={filterCountry}
                          href={createFilterHref({ country: filterCountry, location })}
                          className={`inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
                            country === filterCountry
                              ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                              : "border-[var(--color-border)] bg-white"
                          }`}
                        >
                          {filterCountry}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {filters.locations.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      Location
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={createFilterHref({ country })}
                        className={`inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
                          !location
                            ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                            : "border-[var(--color-border)] bg-white"
                        }`}
                      >
                        All locations
                      </Link>
                      {filters.locations.map((filterLocation) => (
                        <Link
                          key={filterLocation}
                          href={createFilterHref({ country, location: filterLocation })}
                          className={`inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
                            location === filterLocation
                              ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                              : "border-[var(--color-border)] bg-white"
                          }`}
                        >
                          {filterLocation}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {hasActiveFilters ? (
                <Link
                  href="/trips"
                  className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)]"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        {publishedTrips.length === 0 ? (
          <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">No trips published yet</p>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              Rachel’s first public travel story will appear here as soon as it is published.
            </p>
          </section>
        ) : filteredTrips.length === 0 ? (
          <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">No trips match these filters</p>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              Try clearing one or both filters to browse all published destinations again.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Published trips">
            {filteredTrips.map((trip) => (
              <article
                key={trip.slug}
                className="space-y-4 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-frame)]"
              >
                {trip.coverImageUrl ? (
                  <ImageFrame rotation="left" className="bg-[var(--color-bg)] p-1">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={trip.coverImageUrl}
                        alt={trip.coverImageAlt}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </ImageFrame>
                ) : (
                  <div className="rounded-[var(--radius-frame)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-sm text-[var(--color-muted)]">
                    Cover image coming soon
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {formatTripPlace(trip.location, trip.country) || "Location to be announced"}
                  </p>
                  {trip.travelDates ? (
                    <p className="text-sm text-[var(--color-muted)]">{trip.travelDates}</p>
                  ) : null}
                  <h2 className="text-2xl uppercase leading-[0.92]">{trip.title}</h2>
                  <p className="text-sm text-[var(--color-muted)]">{trip.excerpt}</p>
                  <Link
                    href={`/trips/${trip.slug}`}
                    className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)]"
                  >
                    Read trip
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </ContentContainer>
    </main>
  );
}
