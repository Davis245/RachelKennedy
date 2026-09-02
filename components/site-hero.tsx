import { siteCopy } from "@/lib/site";
import { AccentPill } from "@/components/ui/accent-pill";
import { ContentContainer } from "@/components/ui/content-container";
import { ImageFrame } from "@/components/ui/image-frame";
import { PostMetadata } from "@/components/ui/post-metadata";
import { SectionHeading } from "@/components/ui/section-heading";

export function SiteHero() {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer>
        <section className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7">
            <div className="flex flex-wrap gap-3">
              <AccentPill tone="mustard">Travel Journal</AccentPill>
              <AccentPill tone="coral">Coming Soon</AccentPill>
            </div>

            <SectionHeading eyebrow={siteCopy.kicker} title={siteCopy.title} />

            <p className="max-w-xl text-base text-[var(--color-muted)] sm:text-lg">{siteCopy.description}</p>

            <PostMetadata location="Lisbon, Portugal" timing="Spring 2026" readTime="5 min read" />
          </div>

          <ImageFrame rotation="right" className="mt-2 max-w-md justify-self-start lg:justify-self-end">
            <div
              aria-label="Upcoming travel photography"
              role="img"
              className="aspect-[4/5] w-full border border-[var(--color-border)] bg-[var(--color-accent-blue-soft)] p-5"
            >
              <div className="flex h-full items-end border border-[var(--color-border)] bg-[var(--color-accent-coral-soft)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-accent-blue)]">
                  Photo essays from the road
                </p>
              </div>
            </div>
          </ImageFrame>
        </section>
      </ContentContainer>
    </main>
  );
}
