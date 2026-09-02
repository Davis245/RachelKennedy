import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Dancing_Script } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, siteMetadata } from "@/lib/site";
import "./globals.css";

const bodySans = localFont({
  src: "./fonts/DejaVuSans.ttf",
  variable: "--font-body-sans",
  display: "swap",
});

const displayCondensed = localFont({
  src: "./fonts/DejaVuSansCondensed-Bold.ttf",
  variable: "--font-display-condensed",
  display: "swap",
});

const heroDisplay = Dancing_Script({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-hero-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    type: "website",
    url: "/",
    siteName: siteMetadata.title,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodySans.variable} ${displayCondensed.variable} ${heroDisplay.variable} antialiased`}>
        <a
          href="#main-content"
          className="skip-link absolute left-4 top-4 z-[200] rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)]"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
