import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { formatJourneyPlace, getPublishedJourneyBySlug } from "@/lib/posts/public";
import { getCanonicalUrl, siteMetadata } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getPublishedJourneyBySlug(slug);

  if (!journey) {
    return {
      title: "Journey not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = getCanonicalUrl(`/journeys/${journey.slug}`);
  const image = journey.coverImageUrl
    ? [
        {
          url: journey.coverImageUrl,
          alt: journey.coverImageAlt,
        },
      ]
    : undefined;

  return {
    title: journey.title,
    description: journey.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: journey.title,
      description: journey.excerpt,
      siteName: siteMetadata.title,
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: journey.title,
      description: journey.excerpt,
      images: image?.map((entry) => entry.url),
    },
  };
}

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

  const canonicalUrl = getCanonicalUrl(`/journeys/${journey.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: journey.title,
    description: journey.excerpt,
    url: canonicalUrl,
    datePublished: journey.publishedAt ?? undefined,
    image: journey.coverImageUrl ? [journey.coverImageUrl] : undefined,
    author: {
      "@type": "Person",
      name: siteMetadata.title,
    },
  };

  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="space-y-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={journey.coverImageUrl}
                  alt={journey.coverImageAlt}
                  fill
                  sizes="(max-width: 1023px) 100vw, 80vw"
                  className="object-cover"
                  priority
                />
              </div>
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
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={image.imageUrl}
                          alt={image.altText}
                          fill
                          sizes="(max-width: 767px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
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
