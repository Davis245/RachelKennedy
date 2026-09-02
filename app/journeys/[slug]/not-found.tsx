import Link from "next/link";

import { ContentContainer } from "@/components/ui/content-container";

export default function JourneyNotFound() {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer>
        <section className="space-y-4 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
          <h1 className="text-3xl uppercase sm:text-4xl">Journey not found</h1>
          <p className="text-[var(--color-muted)]">This published travel story is not available.</p>
          <Link
            href="/journeys"
            className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-blue)]"
          >
            Back to journeys
          </Link>
        </section>
      </ContentContainer>
    </main>
  );
}
