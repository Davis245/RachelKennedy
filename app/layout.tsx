import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Dancing_Script } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteMetadata } from "@/lib/site";
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
  title: siteMetadata.title,
  description: siteMetadata.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodySans.variable} ${displayCondensed.variable} ${heroDisplay.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
