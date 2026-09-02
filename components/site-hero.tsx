import Image from "next/image";
import Link from "next/link";
import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { homePageFixture } from "@/lib/homepage-fixture";

const heroRotations = ["left", "right", "none"] as const;

export function SiteHero() {
  const { heroPills, heroPhotos, featuredJourney, recentJourneys } = homePageFixture;
  const firstHeroPhoto = heroPhotos[0];
  const secondHeroPhoto = heroPhotos[1];

  return (
    <main className="overflow-x-clip py-8 sm:py-12">
      <section
        className="relative flex min-h-[calc(100svh-6.5rem)] items-center overflow-x-clip px-4 pb-16 sm:px-6 lg:px-10 xl:px-14"
        aria-labelledby="homepage-main-heading"
      >
        <div className="relative mx-auto w-full max-w-[120rem] -translate-y-4 sm:-translate-y-6 lg:-translate-y-8">
          <h1
            id="homepage-main-heading"
            className="relative z-10 text-[clamp(2.7rem,9.3vw,11.6rem)] leading-[0.84] uppercase lg:px-[2vw] lg:tracking-[0.01em]"
          >
            <span className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:flex-nowrap lg:whitespace-nowrap">
              <span className="text-[var(--color-ink)]">Rachel</span>
              <span className="text-[var(--color-accent-coral)]">Kennedy</span>
            </span>
          </h1>

          <div className="pointer-events-none absolute top-[47%] left-[54%] z-30 w-[clamp(9rem,15.5vw,13.8rem)] -translate-x-1/2 -translate-y-1/2 sm:left-[56%]">
            <ImageFrame rotation="left" className="bg-[var(--color-bg)] p-1 shadow-[var(--shadow-frame)]">
              <Image
                src={firstHeroPhoto.src}
                alt={firstHeroPhoto.alt}
                width={firstHeroPhoto.width}
                height={firstHeroPhoto.height}
                sizes="(max-width: 639px) 36vw, (max-width: 1023px) 22vw, 15.5vw"
                className="h-auto w-full"
              />
            </ImageFrame>
          </div>

          <div className="pointer-events-none absolute top-[44%] right-[4%] z-30 w-[clamp(9rem,15vw,13.2rem)] -translate-y-1/2">
            <ImageFrame rotation="right" className="bg-[var(--color-bg)] p-1 shadow-[var(--shadow-frame)]">
              <Image
                src={secondHeroPhoto.src}
                alt={secondHeroPhoto.alt}
                width={secondHeroPhoto.width}
                height={secondHeroPhoto.height}
                sizes="(max-width: 639px) 34vw, (max-width: 1023px) 22vw, 15vw"
                className="h-auto w-full"
              />
            </ImageFrame>
          </div>

          <div className="pointer-events-none absolute right-[6%] bottom-[18%] z-40 rotate-[1deg] sm:right-[12%] lg:right-[20%]">
            <AccentPill tone="mustard">{heroPills[0]}</AccentPill>
          </div>
          <div className="pointer-events-none absolute bottom-[10%] left-[8%] z-40 -rotate-2 sm:left-[16%] lg:left-[23%]">
            <AccentPill tone="blue">{heroPills[1]}</AccentPill>
          </div>
        </div>

        <Link
          href="#featured-journey-heading"
          aria-label="Scroll to featured journey"
          className="absolute bottom-1 left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)] motion-safe:animate-bounce"
        >
          <span>Scroll</span>
          <span aria-hidden="true" className="text-lg leading-none">
            ↓
          </span>
        </Link>
      </section>

      <ContentContainer className="space-y-14 sm:space-y-16">
        <p className="max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
          Dispatches from train windows, mountain roads, and old city streets—travel stories and photographs from near
          and far.
        </p>

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
