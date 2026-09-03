/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { homePageFixture } from "@/lib/homepage-fixture";
import { formatTripPlace, getPublishedTrips } from "@/lib/posts/public";

const heroRotations = ["left", "right", "none"] as const;

export async function SiteHero() {
  const publishedTrips = await getPublishedTrips();
  const [mostRecentTrip, ...recentTrips] = publishedTrips;
  const firstHeroPhoto = homePageFixture.heroPhotos[0];
  const secondHeroPhoto = homePageFixture.heroPhotos[1];

  return (
    <main className="overflow-x-clip">
      <section
        className="relative flex min-h-[100svh] items-center overflow-x-clip px-[clamp(1rem,2vw,2rem)] pb-16 pt-8 sm:pt-12"
        aria-labelledby="homepage-main-heading"
      >
        <div className="relative mx-auto w-full">
          <h1
            id="homepage-main-heading"
            aria-label="Rachel Kennedy"
            className="hero-title relative z-20 grid w-full grid-cols-2 items-center gap-x-4 gap-y-4 text-[clamp(3.3rem,15vw,8rem)] leading-[0.84] sm:text-[clamp(4.2rem,12.5vw,10.2rem)] lg:grid-cols-[auto_minmax(8rem,16.5vw)_auto_minmax(8rem,16.5vw)] lg:justify-between lg:gap-x-0 lg:text-[clamp(5.8rem,10.4vw,13rem)]"
          >
            <span className="relative z-30 inline-block origin-center scale-y-[1.18] text-[var(--color-ink)] lg:scale-y-[1.28]">
              Rachel
            </span>
            <ImageFrame
              rotation="left"
              className="relative z-10 w-full max-w-[13.5rem] justify-self-start bg-[var(--color-bg)] p-1 shadow-[var(--shadow-frame)] sm:max-w-[14.5rem] lg:-ml-9 lg:w-[min(16.5vw,15.5rem)] lg:max-w-none lg:origin-center lg:scale-[1.25]"
            >
              <Image
                src={firstHeroPhoto.src}
                alt={firstHeroPhoto.alt}
                width={firstHeroPhoto.width}
                height={firstHeroPhoto.height}
                sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 16.5vw"
                className="h-auto w-full"
              />
            </ImageFrame>
            <span className="relative z-30 inline-block origin-center scale-y-[1.18] text-[var(--color-accent-coral)] lg:-ml-3 lg:scale-y-[1.28]">
              Kennedy
            </span>
            <ImageFrame
              rotation="right"
              className="relative z-10 w-full max-w-[13.5rem] justify-self-start bg-[var(--color-bg)] p-1 shadow-[var(--shadow-frame)] sm:max-w-[14.5rem] lg:-ml-9 lg:w-[min(16.5vw,15.5rem)] lg:max-w-none lg:origin-right lg:scale-[1.25]"
            >
              <Image
                src={secondHeroPhoto.src}
                alt={secondHeroPhoto.alt}
                width={secondHeroPhoto.width}
                height={secondHeroPhoto.height}
                sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 16.5vw"
                className="h-auto w-full"
              />
            </ImageFrame>
          </h1>
        </div>

        <ScrollIndicator />
      </section>

      <ContentContainer className="space-y-14 sm:space-y-16">
        {mostRecentTrip ? (
          <>
            <section aria-labelledby="most-recent-heading" className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 id="most-recent-heading" className="text-3xl uppercase sm:text-4xl">
                  Most Recent
                </h2>
                <Link
                  href="/trips"
                  className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)] motion-safe:hover:translate-x-0.5"
                >
                  View all trips
                </Link>
              </div>

              <article className="grid gap-6 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
                {mostRecentTrip.coverImageUrl ? (
                  <ImageFrame rotation="left" className="motion-safe:transition-transform motion-safe:hover:-translate-y-1">
                    <img
                      src={mostRecentTrip.coverImageUrl}
                      alt={mostRecentTrip.coverImageAlt}
                      className="h-auto w-full"
                    />
                  </ImageFrame>
                ) : (
                  <div className="rounded-[var(--radius-frame)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]" />
                )}

                <div className="flex flex-col justify-center space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {formatTripPlace(mostRecentTrip.location, mostRecentTrip.country) || "Destination to be announced"}
                    {mostRecentTrip.travelDates ? ` · ${mostRecentTrip.travelDates}` : ""}
                  </p>
                  <h3 className="text-3xl uppercase leading-[0.9] sm:text-4xl">{mostRecentTrip.title}</h3>
                  <p className="text-[var(--color-muted)]">{mostRecentTrip.excerpt}</p>
                  <Link
                    href={`/trips/${mostRecentTrip.slug}`}
                    className="w-fit text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)] motion-safe:hover:translate-x-0.5"
                  >
                    Read trip notes
                  </Link>
                </div>
              </article>
            </section>

            {recentTrips.length > 0 ? (
              <section aria-labelledby="recent-trips-heading" className="space-y-5">
                <h2 id="recent-trips-heading" className="text-3xl uppercase sm:text-4xl">
                  Recent trips
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {recentTrips.slice(0, 3).map((trip, index) => (
                    <article
                      key={trip.slug}
                      className="space-y-4 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4"
                    >
                      {trip.coverImageUrl ? (
                        <ImageFrame
                          rotation={heroRotations[index]}
                          className="bg-[var(--color-bg)] p-1 motion-safe:transition-transform motion-safe:hover:-translate-y-1"
                        >
                          <img src={trip.coverImageUrl} alt={trip.coverImageAlt} className="h-auto w-full" />
                        </ImageFrame>
                      ) : (
                        <div className="rounded-[var(--radius-frame)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-8 text-sm text-[var(--color-muted)]">
                          Cover image coming soon
                        </div>
                      )}
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                        {formatTripPlace(trip.location, trip.country) || "Destination to be announced"}
                        {trip.travelDates ? ` · ${trip.travelDates}` : ""}
                      </p>
                      <h3 className="text-2xl uppercase leading-[0.92]">{trip.title}</h3>
                      <p className="text-sm text-[var(--color-muted)]">{trip.excerpt}</p>
                      <Link
                        href={`/trips/${trip.slug}`}
                        className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)] motion-safe:hover:translate-x-0.5"
                      >
                        Read more
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section
            aria-labelledby="most-recent-heading"
            className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]"
          >
            <h2 id="most-recent-heading" className="text-3xl uppercase sm:text-4xl">
              Most Recent
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
              Rachel’s newest published travel story will appear here once the first trip goes live.
            </p>
          </section>
        )}
      </ContentContainer>
    </main>
  );
}
