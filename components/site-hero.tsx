import Image from "next/image";
import Link from "next/link";
import { ScrollIndicator } from "@/components/scroll-indicator";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { homePageFixture } from "@/lib/homepage-fixture";

const heroRotations = ["left", "right", "none"] as const;

export function SiteHero() {
  const { heroPhotos, featuredJourney, recentJourneys } = homePageFixture;
  const firstHeroPhoto = heroPhotos[0];
  const secondHeroPhoto = heroPhotos[1];

  return (
    <main className="overflow-x-clip py-8 sm:py-12">
      <section
        className="relative flex min-h-[calc(100svh-6.5rem)] items-center overflow-x-clip px-[clamp(1rem,2vw,2rem)] pb-16"
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
