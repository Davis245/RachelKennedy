import type { ReactNode } from "react";

const turns = {
  left: "-rotate-2",
  right: "rotate-2",
  none: "rotate-0",
} as const;

export function ImageFrame({
  children,
  rotation = "left",
  className = "",
}: {
  children: ReactNode;
  rotation?: keyof typeof turns;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-frame)] ${turns[rotation]} ${className}`}
    >
      {children}
    </div>
  );
}
