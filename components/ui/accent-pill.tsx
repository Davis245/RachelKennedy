import type { ReactNode } from "react";

const styles = {
  coral: "border-[var(--color-accent-coral)]/20 bg-[var(--color-accent-coral-soft)] text-[var(--color-accent-coral)]",
  blue: "border-[var(--color-accent-blue)]/20 bg-[var(--color-accent-blue-soft)] text-[var(--color-accent-blue)]",
  mustard:
    "border-[var(--color-accent-mustard)]/20 bg-[var(--color-accent-mustard-soft)] text-[var(--color-accent-mustard)]",
} as const;

export function AccentPill({
  children,
  tone = "mustard",
}: {
  children: ReactNode;
  tone?: keyof typeof styles;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-pill)] border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
