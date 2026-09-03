"use client";

import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  DEFAULT_POST_EDITOR_STATE,
  deletePostAction,
  savePostAction,
  type PostEditorState,
} from "@/app/admin/post-actions";
import { createPostImageStoragePath, validatePostImageFile } from "@/lib/posts/post-images";
import { suggestSlugFromTitle } from "@/lib/posts/slug";
import { EMPTY_RICH_TEXT_DOCUMENT, renderRichTextDocumentToSafeHtml } from "@/lib/rich-text";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { PostStatus } from "@/types/supabase";

type GalleryImageData = {
  id?: string;
  imageUrl: string;
  altText: string;
  caption: string;
  displayOrder: number;
};

type PostEditorData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  location: string;
  country: string;
  travelStartDate: string;
  travelEndDate: string;
  coverImageUrl: string;
  coverImageAlt: string;
  galleryImages: GalleryImageData[];
  content: JSONContent;
  status: PostStatus;
};

type EditorGalleryImage = GalleryImageData & {
  localId: string;
};

const UNSAVED_CHANGES_MESSAGE = "You have unsaved changes. Leave without saving?";

function FieldError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return <p className="text-sm text-[var(--color-accent-coral)]">{error}</p>;
}

function SubmitButtons({ status }: { status: PostStatus }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        name="intent"
        value="save_draft"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save draft"}
      </button>
      <button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : status === "published" ? "Update published" : "Publish"}
      </button>
      {status === "published" ? (
        <button
          type="submit"
          name="intent"
          value="unpublish"
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-accent-coral)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-coral)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Unpublish"}
        </button>
      ) : null}
    </div>
  );
}

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-accent-coral)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-coral)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete post"}
    </button>
  );
}

function normalizeGalleryImages(images: EditorGalleryImage[]): EditorGalleryImage[] {
  return images.map((image, index) => ({
    ...image,
    displayOrder: index,
  }));
}

function formatUploadStatus(status: "idle" | "uploading" | "success" | "error", message: string) {
  if (status === "idle" || !message) {
    return null;
  }

  return (
    <p
      role="status"
      className={
        status === "error"
          ? "text-sm text-[var(--color-accent-coral)]"
          : status === "success"
            ? "text-sm text-[var(--color-muted)]"
            : "text-sm text-[var(--color-muted)]"
      }
    >
      {message}
    </p>
  );
}

export function PostEditor({
  initialData,
  mode,
}: {
  initialData: PostEditorData;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const redirectedPostId = useRef<string | null>(null);
  const supabaseClientRef = useRef(createBrowserSupabaseClient());

  const [title, setTitle] = useState(initialData.title);
  const [slug, setSlug] = useState(initialData.slug || suggestSlugFromTitle(initialData.title));
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit" || Boolean(initialData.slug));
  const [excerpt, setExcerpt] = useState(initialData.excerpt);
  const [location, setLocation] = useState(initialData.location);
  const [country, setCountry] = useState(initialData.country);
  const [travelStartDate, setTravelStartDate] = useState(initialData.travelStartDate);
  const [travelEndDate, setTravelEndDate] = useState(initialData.travelEndDate);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData.coverImageUrl);
  const [coverImageAlt, setCoverImageAlt] = useState(initialData.coverImageAlt);
  const [galleryImages, setGalleryImages] = useState<EditorGalleryImage[]>(
    initialData.galleryImages
      .sort((leftImage, rightImage) => leftImage.displayOrder - rightImage.displayOrder)
      .map((image) => ({
        ...image,
        localId: image.id ?? crypto.randomUUID(),
      })),
  );
  const [coverUploadState, setCoverUploadState] = useState<{
    status: "idle" | "uploading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [galleryUploadState, setGalleryUploadState] = useState<{
    status: "idle" | "uploading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [content, setContent] = useState<JSONContent>(initialData.content);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveState, saveAction] = useActionState<PostEditorState, FormData>(
    async (previousState, formData) => {
      const nextState = await savePostAction(previousState, formData);

      if (nextState.status === "success") {
        setHasUnsavedChanges(false);
      }

      return nextState;
    },
    DEFAULT_POST_EDITOR_STATE,
  );
  const [deleteState, deleteAction] = useActionState<PostEditorState, FormData>(
    deletePostAction,
    DEFAULT_POST_EDITOR_STATE,
  );
  const status = saveState.postStatus ?? initialData.status;
  const activePostId = saveState.postId ?? initialData.id ?? "";

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData.content,
    immediatelyRender: false,
    onUpdate: ({ editor: editorInstance }) => {
      setContent(editorInstance.getJSON());
      setHasUnsavedChanges(true);
    },
  });

  useEffect(() => {
    if (saveState.status !== "success") {
      return;
    }

    if (mode === "create" && saveState.postId && redirectedPostId.current !== saveState.postId) {
      redirectedPostId.current = saveState.postId;
      router.replace(`/admin/posts/${saveState.postId}/edit`);
      router.refresh();
    }
  }, [mode, router, saveState.postId, saveState.status]);

  useEffect(() => {
    if (deleteState.status === "success" && deleteState.deleted) {
      router.replace("/admin");
      router.refresh();
    }
  }, [deleteState.deleted, deleteState.status, router]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor || anchor.target === "_blank") {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#")) {
        return;
      }

      if (!window.confirm(UNSAVED_CHANGES_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [hasUnsavedChanges]);

  const previewHtml = useMemo(() => renderRichTextDocumentToSafeHtml(content), [content]);
  const activeStateMessage = deleteState.message || saveState.message;
  const activeStateStatus = deleteState.message ? deleteState.status : saveState.status;

  const uploadToStorage = async ({
    file,
    kind,
  }: {
    file: File;
    kind: "cover" | "gallery";
  }) => {
    const validationMessage = validatePostImageFile(file);

    if (validationMessage) {
      throw new Error(validationMessage);
    }

    if (!activePostId) {
      throw new Error("Save this post first, then upload images.");
    }

    const objectPath = createPostImageStoragePath(activePostId, kind, file.name);
    const supabase = supabaseClientRef.current;

    const { error } = await supabase.storage.from("post-images").upload(objectPath, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      throw new Error(error.message || "Upload failed.");
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(objectPath);

    return data.publicUrl;
  };

  const handleCoverUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    setCoverUploadState({ status: "uploading", message: "Uploading cover image…" });

    try {
      const publicUrl = await uploadToStorage({ file, kind: "cover" });
      setCoverImageUrl(publicUrl);
      setHasUnsavedChanges(true);
      setCoverUploadState({ status: "success", message: "Cover image uploaded. Save to persist this change." });
    } catch (error) {
      setCoverUploadState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to upload cover image.",
      });
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files);
    const uploadedImages: EditorGalleryImage[] = [];
    setGalleryUploadState({ status: "uploading", message: `Uploading 1 of ${selectedFiles.length} images…` });

    for (const [index, file] of selectedFiles.entries()) {
      try {
        setGalleryUploadState({
          status: "uploading",
          message: `Uploading ${index + 1} of ${selectedFiles.length} images…`,
        });
        const publicUrl = await uploadToStorage({ file, kind: "gallery" });

        uploadedImages.push({
          imageUrl: publicUrl,
          altText: "",
          caption: "",
          displayOrder: galleryImages.length + uploadedImages.length,
          localId: crypto.randomUUID(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to upload gallery images.";

        if (uploadedImages.length > 0) {
          setGalleryImages((currentImages) => normalizeGalleryImages([...currentImages, ...uploadedImages]));
          setHasUnsavedChanges(true);
        }

        setGalleryUploadState({ status: "error", message: `${errorMessage} Uploaded ${uploadedImages.length} image(s).` });
        return;
      }
    }

    if (uploadedImages.length > 0) {
      setGalleryImages((currentImages) => normalizeGalleryImages([...currentImages, ...uploadedImages]));
      setHasUnsavedChanges(true);
    }

    setGalleryUploadState({ status: "success", message: "Gallery images uploaded. Save to persist these changes." });
  };

  return (
    <section className="space-y-5 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)] sm:p-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
          {mode === "create" ? "New post" : `${status} post`}
        </p>
        <h2 className="text-4xl uppercase sm:text-5xl">{mode === "create" ? "Create post" : "Edit post"}</h2>
        <p className="text-[var(--color-muted)]">
          Write Rachel’s travel story, preview safely rendered output, and save as draft or publish.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]"
        >
          Back to posts
        </Link>
        <button
          type="button"
          onClick={() => setShowPreview((currentValue) => !currentValue)}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]"
        >
          {showPreview ? "Hide preview" : "Preview"}
        </button>
      </div>

      {activeStateMessage ? (
        <p
          role="status"
          className={
            activeStateStatus === "success"
              ? "rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-[var(--color-accent-blue-soft)] px-4 py-3 text-sm"
              : "rounded-[var(--radius-frame)] border border-[var(--color-accent-coral)] bg-[var(--color-accent-coral-soft)] px-4 py-3 text-sm"
          }
        >
          {activeStateMessage}
        </p>
      ) : null}

      <form action={saveAction} className="space-y-5">
        <input type="hidden" name="postId" value={activePostId} />
        <input type="hidden" name="content" value={JSON.stringify(content || EMPTY_RICH_TEXT_DOCUMENT)} />
        <input
          type="hidden"
          name="galleryImages"
          value={JSON.stringify(
            galleryImages.map((image, index) => ({
              id: image.id,
              imageUrl: image.imageUrl,
              altText: image.altText,
              caption: image.caption,
              displayOrder: index,
            })),
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!slugManuallyEdited) {
                  setSlug(suggestSlugFromTitle(nextTitle));
                }
                setHasUnsavedChanges(true);
              }}
              required
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.title} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="slug" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value.toLowerCase());
                setSlugManuallyEdited(true);
                setHasUnsavedChanges(true);
              }}
              required
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <p className="text-sm text-[var(--color-muted)]">URL: /trips/{slug || "your-post-slug"}</p>
            <FieldError error={saveState.fieldErrors.slug} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="excerpt" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(event) => {
                setExcerpt(event.target.value);
                setHasUnsavedChanges(true);
              }}
              rows={3}
              className="w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.excerpt} />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
                setHasUnsavedChanges(true);
              }}
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.location} />
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Country
            </label>
            <input
              id="country"
              name="country"
              value={country}
              onChange={(event) => {
                setCountry(event.target.value);
                setHasUnsavedChanges(true);
              }}
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.country} />
          </div>

          <div className="space-y-2">
            <label htmlFor="travelStartDate" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Travel start date
            </label>
            <input
              id="travelStartDate"
              name="travelStartDate"
              type="date"
              value={travelStartDate}
              onChange={(event) => {
                setTravelStartDate(event.target.value);
                setHasUnsavedChanges(true);
              }}
              required
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.travelStartDate} />
          </div>

          <div className="space-y-2">
            <label htmlFor="travelEndDate" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Travel end date (optional)
            </label>
            <input
              id="travelEndDate"
              name="travelEndDate"
              type="date"
              value={travelEndDate}
              onChange={(event) => {
                setTravelEndDate(event.target.value);
                setHasUnsavedChanges(true);
              }}
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.travelEndDate} />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="coverImageUpload" className="block text-sm font-semibold uppercase tracking-[0.18em]">
                Cover image
              </label>
              <input
                id="coverImageUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={!activePostId || coverUploadState.status === "uploading"}
                onChange={(event) => {
                  void handleCoverUpload(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
                className="max-w-full text-sm"
              />
            </div>
            {!activePostId ? <p className="text-sm text-[var(--color-muted)]">Save this post first to upload images.</p> : null}
            {formatUploadStatus(coverUploadState.status, coverUploadState.message)}
            {coverImageUrl ? (
              <div className="space-y-3 rounded-[var(--radius-frame)] border border-[var(--color-border)] p-4">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-frame)] bg-[var(--color-accent-blue-soft)]">
                  <img src={coverImageUrl} alt={coverImageAlt || "Cover preview"} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Remove the cover image from this post?")) {
                        return;
                      }
                      setCoverImageUrl("");
                      setCoverImageAlt("");
                      setHasUnsavedChanges(true);
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-accent-coral)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-coral)]"
                  >
                    Remove cover image
                  </button>
                </div>
              </div>
            ) : null}
            <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
            <FieldError error={saveState.fieldErrors.coverImageUrl} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="coverImageAlt" className="block text-sm font-semibold uppercase tracking-[0.18em]">
              Cover image alt text
            </label>
            <input
              id="coverImageAlt"
              name="coverImageAlt"
              value={coverImageAlt}
              onChange={(event) => {
                setCoverImageAlt(event.target.value);
                setHasUnsavedChanges(true);
              }}
              className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
            />
            <FieldError error={saveState.fieldErrors.coverImageAlt} />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="galleryImageUpload" className="text-sm font-semibold uppercase tracking-[0.18em]">
                Gallery images
              </label>
              <input
                id="galleryImageUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                disabled={!activePostId || galleryUploadState.status === "uploading"}
                onChange={(event) => {
                  void handleGalleryUpload(event.target.files);
                  event.target.value = "";
                }}
                className="max-w-full text-sm"
              />
            </div>
            {formatUploadStatus(galleryUploadState.status, galleryUploadState.message)}
            {galleryImages.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No gallery images uploaded yet.</p>
            ) : (
              <ul className="space-y-4">
                {galleryImages.map((image, index) => (
                  <li key={image.localId} className="space-y-3 rounded-[var(--radius-frame)] border border-[var(--color-border)] p-4">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-frame)] bg-[var(--color-accent-blue-soft)]">
                      <img src={image.imageUrl} alt={image.altText || "Gallery preview"} className="h-full w-full object-cover" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-2 sm:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Alt text</span>
                        <input
                          value={image.altText}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setGalleryImages((currentImages) =>
                              currentImages.map((currentImage, currentIndex) =>
                                currentIndex === index ? { ...currentImage, altText: nextValue } : currentImage,
                              ),
                            );
                            setHasUnsavedChanges(true);
                          }}
                          className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
                        />
                      </label>
                      <label className="space-y-2 sm:col-span-2">
                        <span className="block text-xs font-semibold uppercase tracking-[0.18em]">Caption (optional)</span>
                        <input
                          value={image.caption}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setGalleryImages((currentImages) =>
                              currentImages.map((currentImage, currentIndex) =>
                                currentIndex === index ? { ...currentImage, caption: nextValue } : currentImage,
                              ),
                            );
                            setHasUnsavedChanges(true);
                          }}
                          className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          setGalleryImages((currentImages) => {
                            const nextImages = [...currentImages];
                            [nextImages[index - 1], nextImages[index]] = [nextImages[index], nextImages[index - 1]];
                            return normalizeGalleryImages(nextImages);
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Move up
                      </button>
                      <button
                        type="button"
                        disabled={index === galleryImages.length - 1}
                        onClick={() => {
                          setGalleryImages((currentImages) => {
                            const nextImages = [...currentImages];
                            [nextImages[index], nextImages[index + 1]] = [nextImages[index + 1], nextImages[index]];
                            return normalizeGalleryImages(nextImages);
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Move down
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm("Remove this gallery image from the post?")) {
                            return;
                          }

                          setGalleryImages((currentImages) =>
                            normalizeGalleryImages(currentImages.filter((currentImage) => currentImage.localId !== image.localId)),
                          );
                          setHasUnsavedChanges(true);
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-accent-coral)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-coral)]"
                      >
                        Remove image
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <FieldError error={saveState.fieldErrors.galleryImages} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Story content</p>
          <div className="rounded-[var(--radius-frame)] border border-[var(--color-border)] p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className="rounded border border-[var(--color-border)] px-3 py-1 text-sm"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className="rounded border border-[var(--color-border)] px-3 py-1 text-sm"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className="rounded border border-[var(--color-border)] px-3 py-1 text-sm"
              >
                Bulleted list
              </button>
            </div>
            <EditorContent editor={editor} className="min-h-48 rounded border border-[var(--color-border)] p-3" />
          </div>
          <FieldError error={saveState.fieldErrors.content} />
        </div>

        <SubmitButtons status={status} />
      </form>

      {showPreview ? (
        <section className="space-y-3 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-[var(--color-accent-blue-soft)] p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">Preview</h3>
          <article
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: previewHtml,
            }}
          />
        </section>
      ) : null}

      {mode === "edit" ? (
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm("Delete this post permanently? This cannot be undone.")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="postId" value={activePostId} />
          <DeleteButton disabled={!initialData.id} />
        </form>
      ) : null}
    </section>
  );
}
