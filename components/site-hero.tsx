import Image from "next/image";
import Link from "next/link";
import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { homePageFixture } from "@/lib/homepage-fixture";

const heroRotations = ["left", "right", "none"] as const;

export function SiteHero() {
  const { heroPills, heroPhotos, featuredJourney, recentJourneys } = homePageFixture;

  return (
    <main className="overflow-x-clip py-10 sm:py-14">
      <ContentContainer className="space-y-14 sm:space-y-16">
        <section className="relative overflow-x-clip lg:min-h-[34rem]" aria-labelledby="homepage-main-heading">
          <div className="relative z-10 max-w-3xl space-y-6 lg:pt-8">
            <div className="flex flex-wrap gap-3">
              <AccentPill tone="mustard">{heroPills[0]}</AccentPill>
              <AccentPill tone="coral">{heroPills[1]}</AccentPill>
            </div>

            <h1 id="homepage-main-heading" className="text-[clamp(3.5rem,14vw,10rem)] leading-[0.82] uppercase">
              <span className="block text-[var(--color-ink)]">Rachel</span>
              <span className="block text-[var(--color-accent-coral)]">Kennedy</span>
            </h1>

            <p className="max-w-xl text-base text-[var(--color-muted)] sm:text-lg">
              Dispatches from train windows, mountain roads, and old city streets—travel stories and photographs from
              near and far.
            </p>
          </div>

          <div className="pointer-events-none mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:absolute lg:top-10 lg:right-0 lg:mt-0 lg:w-[52%]">
            {heroPhotos.map((photo, index) => (
              <ImageFrame
                key={photo.src}
                rotation={heroRotations[index]}
                className={`bg-[var(--color-bg)] p-1 ${
                  index === 0 ? "lg:-translate-x-[4.5rem] lg:translate-y-16" : ""
                } ${index === 1 ? "lg:-translate-y-6" : ""}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 639px) 42vw, (max-width: 1023px) 28vw, 22vw"
                  className="h-auto w-full"
                />
              </ImageFrame>
            ))}
          </div>
        </section>

        <section aria-labelledby="featured-journey-heading" className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 id="featured-journey-heading" className="text-3xl uppercase sm:text-4xl">
              Featured journey
            </h2>
            <Link
              href="/journeys"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)] motion-safe:hover:translate-x-0.5"
            >
              View all journeys
            </Link>
          </div>

          <article className="grid gap-6 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
            <ImageFrame rotation="left" className="motion-safe:transition-transform motion-safe:hover:-translate-y-1">
              <Image
                src={featuredJourney.coverImage.src}
                alt={featuredJourney.coverImage.alt}
                width={featuredJourney.coverImage.width}
                height={featuredJourney.coverImage.height}
                sizes="(max-width: 1023px) 100vw, 36vw"
                className="h-auto w-full"
              />
            </ImageFrame>

            <div className="flex flex-col justify-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {featuredJourney.location} · {featuredJourney.travelDates}
              </p>
              <h3 className="text-3xl uppercase leading-[0.9] sm:text-4xl">{featuredJourney.title}</h3>
              <p className="text-[var(--color-muted)]">{featuredJourney.excerpt}</p>
              <Link
                href="/journeys"
                className="w-fit text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)] motion-safe:hover:translate-x-0.5"
              >
                Read journey notes
              </Link>
            </div>
          </article>
        </section>

        <section aria-labelledby="recent-journeys-heading" className="space-y-5">
          <h2 id="recent-journeys-heading" className="text-3xl uppercase sm:text-4xl">
            Recent journeys
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentJourneys.map((journey, index) => (
              <article key={journey.slug} className="space-y-4 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4">
                <ImageFrame
                  rotation={heroRotations[index]}
                  className="bg-[var(--color-bg)] p-1 motion-safe:transition-transform motion-safe:hover:-translate-y-1"
                >
                  <Image
                    src={journey.coverImage.src}
                    alt={journey.coverImage.alt}
                    width={journey.coverImage.width}
                    height={journey.coverImage.height}
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 48vw, 31vw"
                    className="h-auto w-full"
                  />
                </ImageFrame>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {journey.location} · {journey.travelDates}
                </p>
                <h3 className="text-2xl uppercase leading-[0.92]">{journey.title}</h3>
                <p className="text-sm text-[var(--color-muted)]">{journey.excerpt}</p>
                <Link
                  href="/journeys"
                  className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)] motion-safe:hover:translate-x-0.5"
                >
                  Read more
                </Link>
              </article>
            ))}
          </div>
        </section>
      </ContentContainer>
    </main>
  );
}
