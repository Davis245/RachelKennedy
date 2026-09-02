import "server-only";

import { createClient } from "@supabase/supabase-js";

import { EMPTY_RICH_TEXT_DOCUMENT, isRichTextDocument, renderRichTextDocumentToSafeHtml } from "@/lib/rich-text";
import { getPublicSupabaseEnv, hasPublicSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/supabase";

type PublishedPostRow = Pick<
  Database["public"]["Tables"]["posts"]["Row"],
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "content"
  | "cover_image_url"
  | "cover_image_alt"
  | "location"
  | "country"
  | "travel_start_date"
  | "travel_end_date"
  | "published_at"
>;

type PublishedPostImageRow = Pick<
  Database["public"]["Tables"]["post_images"]["Row"],
  "id" | "image_url" | "alt_text" | "caption" | "display_order"
>;

export type JourneyPreview = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  location: string | null;
  country: string | null;
  travelDates: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string;
};

export type JourneyGalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string | null;
  displayOrder: number;
};

export type JourneyStory = JourneyPreview & {
  contentHtml: string;
  galleryImages: JourneyGalleryImage[];
};

type JourneyFilters = {
  countries: string[];
  locations: string[];
};

function createPublicSupabaseClient() {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  const { url, publishableKey } = getPublicSupabaseEnv();

  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function formatTravelDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function fallbackCoverImageAlt(title: string) {
  return `${title} cover image`;
}

function mapJourneyPreview(post: PublishedPostRow): JourneyPreview {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.trim() || "Rachel’s full story from this journey is coming soon.",
    publishedAt: post.published_at,
    location: post.location,
    country: post.country,
    travelDates: formatTravelDates(post.travel_start_date, post.travel_end_date),
    coverImageUrl: post.cover_image_url,
    coverImageAlt: post.cover_image_alt?.trim() || fallbackCoverImageAlt(post.title),
  };
}

export function formatTravelDates(startDate: string | null, endDate: string | null) {
  if (startDate && endDate) {
    if (startDate === endDate) {
      return formatTravelDate(startDate);
    }

    return `${formatTravelDate(startDate)} – ${formatTravelDate(endDate)}`;
  }

  if (startDate) {
    return formatTravelDate(startDate);
  }

  if (endDate) {
    return formatTravelDate(endDate);
  }

  return null;
}

export function formatJourneyPlace(location: string | null, country: string | null) {
  return [location, country].filter(Boolean).join(", ");
}

export function getJourneyFilters(posts: JourneyPreview[]): JourneyFilters {
  const countries = new Set<string>();
  const locations = new Set<string>();

  for (const post of posts) {
    if (post.country) {
      countries.add(post.country);
    }

    if (post.location) {
      locations.add(post.location);
    }
  }

  return {
    countries: Array.from(countries).sort((left, right) => left.localeCompare(right)),
    locations: Array.from(locations).sort((left, right) => left.localeCompare(right)),
  };
}

export async function getPublishedJourneys() {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, location, country, travel_start_date, travel_end_date, published_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load published journeys.");
  }

  return ((data ?? []) as PublishedPostRow[]).map(mapJourneyPreview);
}

export async function getPublishedJourneyBySlug(slug: string): Promise<JourneyStory | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, location, country, travel_start_date, travel_end_date, published_at",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  const post = data as PublishedPostRow | null;

  if (error) {
    throw new Error(error.message || "Unable to load this journey.");
  }

  if (!post) {
    return null;
  }

  const { data: imageData, error: imageError } = await supabase
    .from("post_images")
    .select("id, image_url, alt_text, caption, display_order")
    .eq("post_id", post.id)
    .order("display_order", { ascending: true });

  if (imageError) {
    throw new Error(imageError.message || "Unable to load journey images.");
  }

  return {
    ...mapJourneyPreview(post),
    contentHtml: renderRichTextDocumentToSafeHtml(
      isRichTextDocument(post.content) ? post.content : EMPTY_RICH_TEXT_DOCUMENT,
    ),
    galleryImages: ((imageData ?? []) as PublishedPostImageRow[]).map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      altText: image.alt_text,
      caption: image.caption,
      displayOrder: image.display_order,
    })),
  };
}
