"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ContentContainer } from "@/components/ui/content-container";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#all-trips", label: "Trips" },
  { href: "/#about", label: "About" },
];

function subscribeToScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function getScrollSnapshot() {
  return window.scrollY > 0;
}

function getServerScrollSnapshot() {
  return false;
}

function subscribeToHydration() {
  return () => undefined;
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasScrolled = useSyncExternalStore(subscribeToScroll, getScrollSnapshot, getServerScrollSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isVisible = isHydrated && (!isHomePage || hasScrolled);

  return (
    <header
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={`${isHomePage ? "fixed inset-x-0 top-0 z-50" : "relative z-50"} border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <ContentContainer className="py-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-[0.06em] uppercase">
            Rachel Kennedy
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:block">
            <ul className="flex items-center gap-7 text-sm font-semibold uppercase tracking-[0.18em]">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--color-accent-blue)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            Menu
          </button>
        </div>

        {isMenuOpen ? (
          <nav id="mobile-nav" aria-label="Mobile navigation" className="mt-4 md:hidden">
            <ul className="grid gap-2 border-t border-[var(--color-border)] pt-4 text-sm font-semibold uppercase tracking-[0.18em]">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-2 py-2 hover:bg-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </ContentContainer>
    </header>
  );
}
