"use client";

import { useEffect } from "react";

import { ContentContainer } from "@/components/ui/content-container";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="py-10 sm:py-12">
      <ContentContainer className="flex justify-center">
        <section className="w-full max-w-2xl space-y-5 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)] sm:p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Admin error
            </p>
            <h1 className="text-4xl uppercase sm:text-5xl">The dashboard could not load</h1>
            <p className="text-[var(--color-muted)]">
              Please try again. If the problem persists, check the Supabase configuration and admin access.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]"
          >
            Try again
          </button>
        </section>
      </ContentContainer>
    </main>
  );
}
