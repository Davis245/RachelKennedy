"use client";

import { ContentContainer } from "@/components/ui/content-container";

export default function JourneysError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer>
        <section className="space-y-4 rounded-[var(--radius-frame)] border border-[var(--color-accent-coral)] bg-[var(--color-accent-coral-soft)] p-6 shadow-[var(--shadow-frame)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Unable to load journeys</p>
          <p className="text-sm">{error.message || "Please try again in a moment."}</p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--color-accent-coral)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]"
          >
            Try again
          </button>
        </section>
      </ContentContainer>
    </main>
  );
}
