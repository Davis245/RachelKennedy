import "server-only";

import { createClient } from "@supabase/supabase-js";

import { homePageFixture } from "@/lib/homepage-fixture";
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

export type TripPreview = {
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

export type TripGalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
  caption: string | null;
  displayOrder: number;
};

export type TripStory = TripPreview & {
  contentHtml: string;
  galleryImages: TripGalleryImage[];
};

const demoPostDetails: Record<
  string,
  {
    publishedAt: string;
    contentHtml: string;
    galleryImages: TripGalleryImage[];
  }
> = {
  "coastal-trains-through-portugal": {
    publishedAt: "2026-06-15T09:00:00.000Z",
    contentHtml:
      "<p>The first train left Lisbon just after breakfast, following the water past tiled stations and quiet neighbourhoods.</p><h2>A day beside the Atlantic</h2><p>We stopped wherever the view looked promising, carrying little more than a camera and a loose plan for the afternoon.</p><p>By sunset, the platforms were glowing and the return journey felt like part of the destination.</p>",
    galleryImages: [
      {
        id: "demo-portugal-coast",
        imageUrl: "/images/temp-hero-coast-photo.jpg",
        altText: "A temporary coastal landscape used to preview a Portugal trip gallery",
        caption: "Atlantic light along the coast.",
        displayOrder: 0,
      },
      {
        id: "demo-portugal-tram",
        imageUrl: "/images/temp-lisbon-tram.svg",
        altText: "A temporary Lisbon tram illustration used to preview a trip gallery",
        caption: "An afternoon among Lisbon’s tiled streets.",
        displayOrder: 1,
      },
    ],
  },
  "courtyard-notes-from-marrakesh": {
    publishedAt: "2026-05-20T09:00:00.000Z",
    contentHtml:
      "<p>Marrakesh changed pace from one street to the next: busy market lanes opened into still courtyards filled with patterned tile and orange trees.</p><h2>Following the side streets</h2><p>The best photographs came from slowing down, looking through open doorways, and returning to the same corners as the evening light changed.</p>",
    galleryImages: [
      {
        id: "demo-marrakesh-market",
        imageUrl: "/images/temp-marrakesh-market.svg",
        altText: "A temporary Marrakesh market illustration used to preview a trip gallery",
        caption: "Colour and movement in the market lanes.",
        displayOrder: 0,
      },
    ],
  },
  "wind-and-stone-in-patagonia": {
    publishedAt: "2026-02-03T09:00:00.000Z",
    contentHtml:
      "<p>The trail began under clear skies and reached the first ridge just as the clouds started gathering around the peaks.</p><h2>Weather in motion</h2><p>Every hour brought a different view across the valley, from bright glacier water to long shadows moving over the stone.</p>",
    galleryImages: [
      {
        id: "demo-patagonia-ridge",
        imageUrl: "/images/temp-hero-ridge-photo.jpg",
        altText: "A temporary mountain ridge photograph used to preview a Patagonia trip gallery",
        caption: "Clouds moving across the ridge.",
        displayOrder: 0,
      },
      {
        id: "demo-patagonia-peaks",
        imageUrl: "/images/temp-patagonia-peaks.svg",
        altText: "A temporary mountain illustration used to preview a Patagonia trip gallery",
        caption: null,
        displayOrder: 1,
      },
    ],
  },
  "quiet-mornings-in-kyoto": {
    publishedAt: "2025-11-18T09:00:00.000Z",
    contentHtml:
      "<p>Kyoto was quietest before the shops opened, when temple paths were nearly empty and the first coffee counters were just beginning their day.</p><h2>Before the city wakes</h2><p>Walking without a schedule made room for small details: bicycles beside wooden houses, lanterns above narrow lanes, and gardens glimpsed through gates.</p>",
    galleryImages: [
      {
        id: "demo-kyoto-lanterns",
        imageUrl: "/images/temp-kyoto-lanterns.svg",
        altText: "A temporary Kyoto lantern illustration used to preview a trip gallery",
        caption: "Lantern light along a quiet side street.",
        displayOrder: 0,
      },
    ],
  },
};

const demoTripStories: TripStory[] = [homePageFixture.mostRecentTrip, ...homePageFixture.recentTrips]
  .map((trip) => {
    const details = demoPostDetails[trip.slug];
    const placeParts = trip.location.split(", ");
    const country = placeParts.pop() ?? null;

    return {
      slug: trip.slug,
      title: trip.title,
      excerpt: trip.excerpt,
      publishedAt: details.publishedAt,
      location: placeParts.join(", ") || null,
      country,
      travelDates: trip.travelDates,
      coverImageUrl: trip.coverImage.src,
      coverImageAlt: trip.coverImage.alt,
      contentHtml: details.contentHtml,
      galleryImages: details.galleryImages,
    };
  })
  .sort((left, right) => Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? ""));

const demoTripPreviews: TripPreview[] = demoTripStories.map((trip) => ({
  slug: trip.slug,
  title: trip.title,
  excerpt: trip.excerpt,
  publishedAt: trip.publishedAt,
  location: trip.location,
  country: trip.country,
  travelDates: trip.travelDates,
  coverImageUrl: trip.coverImageUrl,
  coverImageAlt: trip.coverImageAlt,
}));

function shouldUseDemoPosts() {
  return process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
}

function getDemoTripBySlug(slug: string) {
  return demoTripStories.find((trip) => trip.slug === slug) ?? null;
}

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

function mapTripPreview(post: PublishedPostRow): TripPreview {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.trim() || "Rachel’s full story from this trip is coming soon.",
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

export function formatTripPlace(location: string | null, country: string | null) {
  return [location, country].filter(Boolean).join(", ");
}

export async function getPublishedTrips(): Promise<TripPreview[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return shouldUseDemoPosts() ? demoTripPreviews : [];
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, content, cover_image_url, cover_image_alt, location, country, travel_start_date, travel_end_date, published_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to load published trips.");
  }

  const publishedTrips = ((data ?? []) as PublishedPostRow[]).map(mapTripPreview);
  return publishedTrips.length === 0 && shouldUseDemoPosts() ? demoTripPreviews : publishedTrips;
}

export async function getPublishedTripBySlug(slug: string): Promise<TripStory | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return shouldUseDemoPosts() ? getDemoTripBySlug(slug) : null;
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
    throw new Error(error.message || "Unable to load this trip.");
  }

  if (!post) {
    return shouldUseDemoPosts() ? getDemoTripBySlug(slug) : null;
  }

  const { data: imageData, error: imageError } = await supabase
    .from("post_images")
    .select("id, image_url, alt_text, caption, display_order")
    .eq("post_id", post.id)
    .order("display_order", { ascending: true });

  if (imageError) {
    throw new Error(imageError.message || "Unable to load trip images.");
  }

  return {
    ...mapTripPreview(post),
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
