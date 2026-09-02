import Link from "next/link";

import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatJourneyPlace, getJourneyFilters, getPublishedJourneys } from "@/lib/posts/public";

export const revalidate = 300;

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
  return query ? `/journeys?${query}` : "/journeys";
}

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string | string[]; location?: string | string[] }>;
}) {
  const [resolvedSearchParams, publishedJourneys] = await Promise.all([searchParams, getPublishedJourneys()]);
  const country = getSingleSearchParam(resolvedSearchParams.country);
  const location = getSingleSearchParam(resolvedSearchParams.location);
  const filters = getJourneyFilters(publishedJourneys);
  const filteredJourneys = publishedJourneys.filter((journey) => {
    if (country && journey.country !== country) {
      return false;
    }

    if (location && journey.location !== location) {
      return false;
    }

    return true;
  });
  const hasActiveFilters = Boolean(country || location);

  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="space-y-10">
        <AccentPill tone="blue">Journeys</AccentPill>
        <SectionHeading eyebrow="Stories by destination" title="Published travel stories" />
        <p className="max-w-2xl text-[var(--color-muted)]">
          Browse Rachel’s published travel writing by destination, then open each journey for the full story and
          gallery.
        </p>

        {publishedJourneys.length > 0 ? (
          <section className="space-y-6" aria-labelledby="journey-filters-heading">
            <div className="space-y-3">
              <h2 id="journey-filters-heading" className="text-2xl uppercase">
                Filter journeys
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
                  href="/journeys"
                  className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)]"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}

        {publishedJourneys.length === 0 ? (
          <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">No journeys published yet</p>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              Rachel’s first public travel story will appear here as soon as it is published.
            </p>
          </section>
        ) : filteredJourneys.length === 0 ? (
          <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">No journeys match these filters</p>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              Try clearing one or both filters to browse all published destinations again.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Published journeys">
            {filteredJourneys.map((journey) => (
              <article
                key={journey.slug}
                className="space-y-4 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-frame)]"
              >
                {journey.coverImageUrl ? (
                  <ImageFrame rotation="left" className="bg-[var(--color-bg)] p-1">
                    <img
                      src={journey.coverImageUrl}
                      alt={journey.coverImageAlt}
                      className="h-auto w-full"
                      loading="lazy"
                    />
                  </ImageFrame>
                ) : (
                  <div className="rounded-[var(--radius-frame)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-sm text-[var(--color-muted)]">
                    Cover image coming soon
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {formatJourneyPlace(journey.location, journey.country) || "Location to be announced"}
                  </p>
                  {journey.travelDates ? (
                    <p className="text-sm text-[var(--color-muted)]">{journey.travelDates}</p>
                  ) : null}
                  <h2 className="text-2xl uppercase leading-[0.92]">{journey.title}</h2>
                  <p className="text-sm text-[var(--color-muted)]">{journey.excerpt}</p>
                  <Link
                    href={`/journeys/${journey.slug}`}
                    className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)]"
                  >
                    Read journey
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
