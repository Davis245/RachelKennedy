"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function ScrollIndicator() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 0);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <Link
      href="#most-recent-heading"
      aria-label="Scroll to the most recent trip"
      aria-hidden={hasScrolled}
      tabIndex={hasScrolled ? -1 : undefined}
      className={`absolute bottom-1 left-1/2 inline-flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)] transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
        hasScrolled ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100 motion-safe:animate-bounce"
      }`}
    >
      <span>Scroll</span>
      <span aria-hidden="true" className="text-lg leading-none">
        ↓
      </span>
    </Link>
  );
}
