import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { formatJourneyPlace, getPublishedJourneyBySlug } from "@/lib/posts/public";

export const revalidate = 300;

export default async function JourneyStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const journey = await getPublishedJourneyBySlug(slug);

  if (!journey) {
    notFound();
  }

  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="space-y-8">
        <Link
          href="/journeys"
          className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)]"
        >
          ← Back to journeys
        </Link>

        <article className="space-y-8">
          <header className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {formatJourneyPlace(journey.location, journey.country) || "Destination to be announced"}
            </p>
            <h1 className="text-4xl uppercase leading-[0.92] sm:text-5xl">{journey.title}</h1>
            {journey.travelDates ? <p className="text-sm text-[var(--color-muted)]">{journey.travelDates}</p> : null}
          </header>

          {journey.coverImageUrl ? (
            <ImageFrame rotation="left" className="bg-[var(--color-bg)] p-1">
              <img src={journey.coverImageUrl} alt={journey.coverImageAlt} className="h-auto w-full" />
            </ImageFrame>
          ) : null}

          <div
            className="space-y-4 text-[var(--color-ink)] [&_a]:text-[var(--color-accent-blue)] [&_h1]:text-3xl [&_h1]:uppercase [&_h2]:text-2xl [&_h2]:uppercase [&_h3]:text-xl [&_h3]:uppercase [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_p]:text-base [&_p]:text-[var(--color-ink)] [&_ul]:space-y-2"
            dangerouslySetInnerHTML={{ __html: journey.contentHtml }}
          />

          {journey.galleryImages.length > 0 ? (
            <section className="space-y-5" aria-labelledby="journey-gallery-heading">
              <h2 id="journey-gallery-heading" className="text-3xl uppercase">
                Gallery
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {journey.galleryImages.map((image) => (
                  <figure key={image.id} className="space-y-3">
                    <ImageFrame rotation="none" className="bg-[var(--color-bg)] p-1">
                      <img src={image.imageUrl} alt={image.altText} className="h-auto w-full" loading="lazy" />
                    </ImageFrame>
                    {image.caption ? <figcaption className="text-sm text-[var(--color-muted)]">{image.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </ContentContainer>
    </main>
  );
}
