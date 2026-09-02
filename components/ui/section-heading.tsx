export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">{eyebrow}</p>
      <h1 className="text-5xl uppercase leading-[0.92] sm:text-7xl">{title}</h1>
    </div>
  );
}
