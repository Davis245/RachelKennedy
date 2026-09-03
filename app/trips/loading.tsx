import { ContentContainer } from "@/components/ui/content-container";

export default function TripsLoading() {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer>
        <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Loading trips…</p>
        </section>
      </ContentContainer>
    </main>
  );
}
