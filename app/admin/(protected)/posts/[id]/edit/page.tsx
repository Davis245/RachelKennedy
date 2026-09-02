import { notFound } from "next/navigation";

import { PostEditor } from "@/components/admin/post-editor";
import { EMPTY_RICH_TEXT_DOCUMENT, isRichTextDocument } from "@/lib/rich-text";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type EditablePost = Pick<
  Database["public"]["Tables"]["posts"]["Row"],
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "location"
  | "country"
  | "travel_start_date"
  | "travel_end_date"
  | "cover_image_url"
  | "cover_image_alt"
  | "content"
  | "status"
>;

type EditablePostImage = Pick<
  Database["public"]["Tables"]["post_images"]["Row"],
  "id" | "image_url" | "alt_text" | "caption" | "display_order"
>;

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const [{ data, error }, { data: postImagesData, error: postImagesError }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, location, country, travel_start_date, travel_end_date, cover_image_url, cover_image_alt, content, status",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("post_images")
      .select("id, image_url, alt_text, caption, display_order")
      .eq("post_id", id)
      .order("display_order", { ascending: true }),
  ]);

  if (error || !data || postImagesError) {
    notFound();
  }

  const post: EditablePost = data;
  const postImages = (postImagesData ?? []) as EditablePostImage[];

  return (
    <PostEditor
      mode="edit"
      initialData={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        location: post.location ?? "",
        country: post.country ?? "",
        travelStartDate: post.travel_start_date ?? "",
        travelEndDate: post.travel_end_date ?? "",
        coverImageUrl: post.cover_image_url ?? "",
        coverImageAlt: post.cover_image_alt ?? "",
        galleryImages: postImages.map((imageRecord) => ({
          id: imageRecord.id,
          imageUrl: imageRecord.image_url,
          altText: imageRecord.alt_text,
          caption: imageRecord.caption ?? "",
          displayOrder: imageRecord.display_order,
        })),
        content: isRichTextDocument(post.content) ? post.content : EMPTY_RICH_TEXT_DOCUMENT,
        status: post.status,
      }}
    />
  );
}
