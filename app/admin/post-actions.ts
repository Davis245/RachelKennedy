"use server";

import type { JSONContent } from "@tiptap/core";
import type { Database, Json, PostStatus } from "@/types/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isRichTextDocument, parseRichTextDocument } from "@/lib/rich-text";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const intentSchema = z.enum(["save_draft", "publish", "unpublish"]);

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
    .select("slug")
    .eq("id", postId)
    .maybeSingle();
  const existingPost = existingPostData as Pick<Database["public"]["Tables"]["posts"]["Row"], "slug"> | null;

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
