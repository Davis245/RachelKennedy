const POST_IMAGES_BUCKET = "post-images";

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export function createPostImageStoragePath(postId: string, kind: "cover" | "gallery", fileName: string): string {
  const safeFileName = sanitizeFileName(fileName || "image");

  return `posts/${postId}/${kind}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;
}

export function validatePostImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return "Please upload a JPEG, PNG, WebP, or AVIF image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Please upload an image smaller than 50MB.";
  }

  return null;
}

export function extractPostImageObjectPath(imageUrl: string): string | null {
  try {
    const parsedUrl = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${POST_IMAGES_BUCKET}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}
