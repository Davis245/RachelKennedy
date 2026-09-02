"use server";

import type { JSONContent } from "@tiptap/core";
import type { Database, Json, PostStatus } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { extractPostImageObjectPath } from "@/lib/posts/post-images";
import { isRichTextDocument, parseRichTextDocument } from "@/lib/rich-text";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const intentSchema = z.enum(["save_draft", "publish", "unpublish"]);

const galleryImageSchema = z.object({
  id: z.string().uuid().optional(),
  imageUrl: z.url().trim(),
  altText: z.string().trim().min(1, "Gallery image alt text is required.").max(250),
  caption: z.string().trim().max(500, "Gallery image caption must be 500 characters or fewer."),
  displayOrder: z.number().int().nonnegative(),
});

const postSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required.")
      .regex(SLUG_PATTERN, "Use lowercase letters, numbers, and single hyphens only."),
    excerpt: z.string().trim().max(500, "Excerpt must be 500 characters or fewer."),
    location: z.string().trim().max(120, "Location must be 120 characters or fewer."),
    country: z.string().trim().max(120, "Country must be 120 characters or fewer."),
    travelStartDate: z
      .string()
      .trim()
      .min(1, "Travel start date is required.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Travel start date must be a valid date."),
    travelEndDate: z.string().trim(),
    coverImageUrl: z.string().trim(),
    coverImageAlt: z.string().trim().max(250, "Cover image alt text must be 250 characters or fewer."),
    galleryImages: z.array(galleryImageSchema),
    content: z.custom<JSONContent>(isRichTextDocument, {
      message: "Rich-text content is invalid.",
    }),
  })
  .superRefine((value, context) => {
    if (value.travelEndDate && value.travelEndDate < value.travelStartDate) {
      context.addIssue({
        code: "custom",
        path: ["travelEndDate"],
        message: "Travel end date cannot be earlier than the start date.",
      });
    }

    if (value.coverImageUrl) {
      const coverImageUrlResult = z.url().safeParse(value.coverImageUrl);

      if (!coverImageUrlResult.success) {
        context.addIssue({
          code: "custom",
          path: ["coverImageUrl"],
          message: "Cover image URL must be a valid URL.",
        });
      }

      if (!value.coverImageAlt) {
        context.addIssue({
          code: "custom",
          path: ["coverImageAlt"],
          message: "Cover image alt text is required when a cover image URL is set.",
        });
      }
    }
  });

const postIdSchema = z.string().uuid("Invalid post id.");

type GalleryImagePayload = z.infer<typeof galleryImageSchema>;

type PostImageRow = Pick<Database["public"]["Tables"]["post_images"]["Row"], "id" | "image_url">;

type FieldErrors = Partial<
  Record<
    | "title"
    | "slug"
    | "excerpt"
    | "location"
    | "country"
    | "travelStartDate"
    | "travelEndDate"
    | "coverImageUrl"
    | "coverImageAlt"
    | "galleryImages"
    | "content",
    string
  >
>;

export type PostEditorState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: FieldErrors;
  postId?: string;
  postStatus?: PostStatus;
  deleted?: boolean;
};

export const DEFAULT_POST_EDITOR_STATE: PostEditorState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

async function ensureAdminContext() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      isAdmin: false,
    };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    return {
      supabase,
      isAdmin: false,
    };
  }

  return {
    supabase,
    isAdmin: true,
  };
}

function getStatusFromIntent(intent: z.infer<typeof intentSchema>): PostStatus {
  return intent === "publish" ? "published" : "draft";
}

function formatFieldErrors(error: z.ZodError<z.infer<typeof postSchema>>): FieldErrors {
  const errors = error.flatten().fieldErrors;

  return {
    title: errors.title?.[0],
    slug: errors.slug?.[0],
    excerpt: errors.excerpt?.[0],
    location: errors.location?.[0],
    country: errors.country?.[0],
    travelStartDate: errors.travelStartDate?.[0],
    travelEndDate: errors.travelEndDate?.[0],
    coverImageUrl: errors.coverImageUrl?.[0],
    coverImageAlt: errors.coverImageAlt?.[0],
    galleryImages: errors.galleryImages?.[0],
    content: errors.content?.[0],
  };
}

function revalidateRoutes(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/journeys");
  revalidatePath("/admin");

  for (const slug of slugs) {
    revalidatePath(`/posts/${slug}`);
    revalidatePath(`/journeys/${slug}`);
  }
}

function parseGalleryImages(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return galleryImageSchema.array().safeParse([]);
  }

  try {
    const parsedJson: unknown = JSON.parse(value);

    return galleryImageSchema.array().safeParse(parsedJson);
  } catch {
    return galleryImageSchema.array().safeParse(null);
  }
}

async function removeStorageObjectIfSafeToDelete(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, imageUrl: string) {
  const objectPath = extractPostImageObjectPath(imageUrl);

  if (!objectPath) {
    return;
  }

  const [{ count: coverReferenceCount, error: coverReferenceError }, { count: galleryReferenceCount, error: galleryReferenceError }] =
    await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("cover_image_url", imageUrl),
      supabase.from("post_images").select("id", { count: "exact", head: true }).eq("image_url", imageUrl),
    ]);

  if (coverReferenceError || galleryReferenceError) {
    return;
  }

  if ((coverReferenceCount ?? 0) > 0 || (galleryReferenceCount ?? 0) > 0) {
    return;
  }

  await supabase.storage.from("post-images").remove([objectPath]);
}

async function syncGalleryImagesForPost({
  supabase,
  postId,
  galleryImages,
}: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  postId: string;
  galleryImages: GalleryImagePayload[];
}) {
  const { data: existingImagesData, error: existingImagesError } = await supabase
    .from("post_images")
    .select("id, image_url")
    .eq("post_id", postId);

  if (existingImagesError) {
    return {
      ok: false as const,
      message: existingImagesError.message || "Unable to load existing gallery images.",
    };
  }

  const existingImages = (existingImagesData ?? []) as PostImageRow[];
  const existingImagesById = new Map(existingImages.map((record) => [record.id, record]));
  const submittedExistingIds = new Set(
    galleryImages.flatMap((image) => (image.id ? [image.id] : [])),
  );
  const unknownImageId = [...submittedExistingIds].find((imageId) => !existingImagesById.has(imageId));

  if (unknownImageId) {
    return {
      ok: false as const,
      message: "One of the gallery images no longer belongs to this post. Refresh the editor and try again.",
    };
  }

  const normalizedGalleryImages = galleryImages.map((image, index) => ({
    ...image,
    displayOrder: index,
  }));
  const existingImageUpdates = normalizedGalleryImages.filter(
    (image): image is GalleryImagePayload & { id: string } => Boolean(image.id),
  );

  const updateResults = await Promise.all(
    existingImageUpdates.map((image) =>
      supabase
        .from("post_images")
        .update({
          image_url: image.imageUrl,
          alt_text: image.altText,
          caption: image.caption || null,
          display_order: image.displayOrder,
        } as never)
        .eq("id", image.id)
        .eq("post_id", postId),
    ),
  );
  const failedUpdate = updateResults.find((result) => result.error);

  if (failedUpdate?.error) {
    return {
      ok: false as const,
      message: failedUpdate.error.message || "Unable to update gallery images.",
    };
  }

  const newImages = normalizedGalleryImages.filter((image) => !image.id);

  if (newImages.length > 0) {
    const { error: insertError } = await supabase.from("post_images").insert(
      newImages.map((image) => ({
        post_id: postId,
        image_url: image.imageUrl,
        alt_text: image.altText,
        caption: image.caption || null,
        display_order: image.displayOrder,
      })) as never,
    );

    if (insertError) {
      return {
        ok: false as const,
        message: insertError.message || "Unable to save gallery images.",
      };
    }
  }

  const removedImages = existingImages.filter((image) => !submittedExistingIds.has(image.id));

  if (removedImages.length > 0) {
    const { error: deleteError } = await supabase
      .from("post_images")
      .delete()
      .eq("post_id", postId)
      .in(
        "id",
        removedImages.map((image) => image.id),
      );

    if (deleteError) {
      return {
        ok: false as const,
        message: deleteError.message || "Unable to remove old gallery images.",
      };
    }
  }

  await Promise.all(
    removedImages.map((image) => removeStorageObjectIfSafeToDelete(supabase, image.image_url)),
  );

  return {
    ok: true as const,
  };
}

export async function savePostAction(
  previousState: PostEditorState = DEFAULT_POST_EDITOR_STATE,
  formData: FormData,
): Promise<PostEditorState> {
  void previousState;

  const adminContext = await ensureAdminContext();

  if (!adminContext.isAdmin) {
    return {
      status: "error",
      message: "You are not authorized to update posts.",
      fieldErrors: {},
    };
  }

  const postIdValue = formData.get("postId");
  const parsedPostId = typeof postIdValue === "string" && postIdValue ? postIdSchema.safeParse(postIdValue) : null;
  const postId = parsedPostId?.success ? parsedPostId.data : undefined;

  if (parsedPostId && !parsedPostId.success) {
    return {
      status: "error",
      message: parsedPostId.error.issues[0]?.message ?? "Invalid post id.",
      fieldErrors: {},
    };
  }

  const rawIntent = formData.get("intent");
  const parsedIntent = intentSchema.safeParse(rawIntent);

  if (!parsedIntent.success) {
    return {
      status: "error",
      message: "Unknown post action.",
      fieldErrors: {},
      postId,
    };
  }

  const parsedGalleryImages = parseGalleryImages(formData.get("galleryImages"));

  if (!parsedGalleryImages.success) {
    return {
      status: "error",
      message: "Please fix the gallery image details and try again.",
      fieldErrors: {
        galleryImages: parsedGalleryImages.error.issues[0]?.message ?? "Gallery images are invalid.",
      },
      postId,
    };
  }

  const payload = {
    title: typeof formData.get("title") === "string" ? formData.get("title") : "",
    slug: typeof formData.get("slug") === "string" ? formData.get("slug") : "",
    excerpt: typeof formData.get("excerpt") === "string" ? formData.get("excerpt") : "",
    location: typeof formData.get("location") === "string" ? formData.get("location") : "",
    country: typeof formData.get("country") === "string" ? formData.get("country") : "",
    travelStartDate: typeof formData.get("travelStartDate") === "string" ? formData.get("travelStartDate") : "",
    travelEndDate: typeof formData.get("travelEndDate") === "string" ? formData.get("travelEndDate") : "",
    coverImageUrl: typeof formData.get("coverImageUrl") === "string" ? formData.get("coverImageUrl") : "",
    coverImageAlt: typeof formData.get("coverImageAlt") === "string" ? formData.get("coverImageAlt") : "",
    galleryImages: parsedGalleryImages.data,
    content: parseRichTextDocument(formData.get("content")),
  };

  const parsedPost = postSchema.safeParse(payload);

  if (!parsedPost.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: formatFieldErrors(parsedPost.error),
      postId,
    };
  }

  const status = getStatusFromIntent(parsedIntent.data);
  const normalizedPost = parsedPost.data;

  let duplicateSlugQuery = adminContext.supabase.from("posts").select("id").eq("slug", normalizedPost.slug);

  if (postId) {
    duplicateSlugQuery = duplicateSlugQuery.neq("id", postId);
  }

  const { data: duplicateSlugPost, error: duplicateSlugError } = await duplicateSlugQuery.maybeSingle();

  if (duplicateSlugError) {
    return {
      status: "error",
      message: duplicateSlugError.message,
      fieldErrors: {},
      postId,
    };
  }

  if (duplicateSlugPost) {
    return {
      status: "error",
      message: "That slug is already in use. Choose a different slug.",
      fieldErrors: {
        slug: "This slug is already used by another post.",
      },
      postId,
    };
  }

  const postUpdate: Database["public"]["Tables"]["posts"]["Insert"] = {
    title: normalizedPost.title,
    slug: normalizedPost.slug,
    excerpt: normalizedPost.excerpt || null,
    location: normalizedPost.location || null,
    country: normalizedPost.country || null,
    travel_start_date: normalizedPost.travelStartDate || null,
    travel_end_date: normalizedPost.travelEndDate || null,
    cover_image_url: normalizedPost.coverImageUrl || null,
    cover_image_alt: normalizedPost.coverImageAlt || null,
    content: normalizedPost.content as Json,
    status,
  };

  if (!postId) {
    const { data, error } = await adminContext.supabase
      .from("posts")
      .insert(postUpdate as never)
      .select("id, slug, status")
      .single();
    const createdPost = data as Pick<Database["public"]["Tables"]["posts"]["Row"], "id" | "slug" | "status"> | null;

    if (error) {
      return {
        status: "error",
        message:
          error.code === "23505"
            ? "That slug is already in use. Choose a different slug."
            : error.message || "Unable to create the post.",
        fieldErrors: error.code === "23505" ? { slug: "This slug is already used by another post." } : {},
      };
    }

    if (!createdPost) {
      return {
        status: "error",
        message: "Unable to create the post.",
        fieldErrors: {},
      };
    }

    const gallerySaveResult = await syncGalleryImagesForPost({
      supabase: adminContext.supabase,
      postId: createdPost.id,
      galleryImages: normalizedPost.galleryImages,
    });

    if (!gallerySaveResult.ok) {
      return {
        status: "error",
        message: gallerySaveResult.message,
        fieldErrors: {
          galleryImages: gallerySaveResult.message,
        },
        postId: createdPost.id,
      };
    }

    revalidateRoutes([createdPost.slug]);

    return {
      status: "success",
      message: status === "published" ? "Post published." : "Draft saved.",
      fieldErrors: {},
      postId: createdPost.id,
      postStatus: createdPost.status,
    };
  }

  const { data: existingPostData } = await adminContext.supabase
    .from("posts")
    .select("slug, cover_image_url")
    .eq("id", postId)
    .maybeSingle();
  const existingPost = existingPostData as Pick<Database["public"]["Tables"]["posts"]["Row"], "slug" | "cover_image_url"> | null;

  const { data: updatedPostData, error: updateError } = await adminContext.supabase
    .from("posts")
    .update(postUpdate as never)
    .eq("id", postId)
    .select("id, slug, status")
    .single();
  const updatedPost = updatedPostData as Pick<Database["public"]["Tables"]["posts"]["Row"], "id" | "slug" | "status"> | null;

  if (updateError) {
    return {
      status: "error",
      message:
        updateError.code === "23505"
          ? "That slug is already in use. Choose a different slug."
          : updateError.message || "Unable to update the post.",
      fieldErrors: updateError.code === "23505" ? { slug: "This slug is already used by another post." } : {},
      postId,
    };
  }

  if (!updatedPost) {
    return {
      status: "error",
      message: "Unable to update the post.",
      fieldErrors: {},
      postId,
    };
  }

  const gallerySaveResult = await syncGalleryImagesForPost({
    supabase: adminContext.supabase,
    postId,
    galleryImages: normalizedPost.galleryImages,
  });

  if (!gallerySaveResult.ok) {
    return {
      status: "error",
      message: gallerySaveResult.message,
      fieldErrors: {
        galleryImages: gallerySaveResult.message,
      },
      postId,
    };
  }

  if (existingPost?.cover_image_url && existingPost.cover_image_url !== normalizedPost.coverImageUrl) {
    await removeStorageObjectIfSafeToDelete(adminContext.supabase, existingPost.cover_image_url);
  }

  const slugs = [updatedPost.slug];

  if (existingPost?.slug && existingPost.slug !== updatedPost.slug) {
    slugs.push(existingPost.slug);
  }

  revalidateRoutes(slugs);

  return {
    status: "success",
    message: status === "published" ? "Post published." : parsedIntent.data === "unpublish" ? "Post unpublished." : "Draft saved.",
    fieldErrors: {},
    postId: updatedPost.id,
    postStatus: updatedPost.status,
  };
}

export async function deletePostAction(
  previousState: PostEditorState = DEFAULT_POST_EDITOR_STATE,
  formData: FormData,
): Promise<PostEditorState> {
  void previousState;

  const adminContext = await ensureAdminContext();

  if (!adminContext.isAdmin) {
    return {
      status: "error",
      message: "You are not authorized to delete posts.",
      fieldErrors: {},
    };
  }

  const postIdValue = formData.get("postId");
  const parsedPostId = postIdSchema.safeParse(postIdValue);

  if (!parsedPostId.success) {
    return {
      status: "error",
      message: "Invalid post id.",
      fieldErrors: {},
    };
  }

  const { data: postRecordData } = await adminContext.supabase
    .from("posts")
    .select("slug")
    .eq("id", parsedPostId.data)
    .maybeSingle();
  const postRecord = postRecordData as Pick<Database["public"]["Tables"]["posts"]["Row"], "slug"> | null;

  const { error } = await adminContext.supabase.from("posts").delete().eq("id", parsedPostId.data);

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to delete this post.",
      fieldErrors: {},
      postId: parsedPostId.data,
    };
  }

  revalidateRoutes(postRecord?.slug ? [postRecord.slug] : []);

  return {
    status: "success",
    message: "Post deleted.",
    fieldErrors: {},
    deleted: true,
  };
}
