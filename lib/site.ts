import type { SiteCopy, SiteMetadata } from "@/types/site";

export const siteMetadata: SiteMetadata = {
  title: "Rachel Kennedy",
  description: "A travel blog sharing Rachel Kennedy's photography, destinations, and stories.",
};

const localhostUrl = "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return localhostUrl;
  }

  return trimmedValue.endsWith("/") ? trimmedValue.slice(0, -1) : trimmedValue;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    return localhostUrl;
  }

  try {
    return normalizeSiteUrl(new URL(configuredUrl).toString());
  } catch {
    return localhostUrl;
  }
}

export function getCanonicalUrl(pathname = "/") {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPathname}`;
}

export const siteCopy: SiteCopy = {
  title: "Rachel Kennedy",
  kicker: "Photography, destinations, and personal travel stories",
  description:
    "A minimal placeholder for Rachel Kennedy's upcoming travel blog, built for stories from the road and the images that accompany them.",
};
