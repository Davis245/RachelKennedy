export default function AdminCommentsPage() {
  return (
    <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)] sm:p-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">Comments</p>
        <h2 className="text-4xl uppercase sm:text-5xl">Moderation queue</h2>
        <p className="text-[var(--color-muted)]">
          Comment review tools will live here once the moderation screens are implemented.
        </p>
      </div>
    </section>
  );
}
