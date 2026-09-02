const SLUG_FALLBACK = "untitled-post";

export function suggestSlugFromTitle(title: string) {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || SLUG_FALLBACK;
}
