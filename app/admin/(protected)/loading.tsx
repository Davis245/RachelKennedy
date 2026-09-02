import { ContentContainer } from "@/components/ui/content-container";

export default function AdminLoading() {
  return (
    <main className="py-10 sm:py-12">
      <ContentContainer className="space-y-6">
        <div className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Loading admin dashboard…
          </p>
        </div>
      </ContentContainer>
    </main>
  );
}
