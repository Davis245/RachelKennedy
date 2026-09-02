import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import sanitizeHtml from "sanitize-html";

export const EMPTY_RICH_TEXT_DOCUMENT: JSONContent = {
  type: "doc",
  content: [],
};

export function isRichTextDocument(value: unknown): value is JSONContent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.type === "doc" && Array.isArray(record.content);
}

export function parseRichTextDocument(value: FormDataEntryValue | null): JSONContent {
  if (typeof value !== "string" || !value.trim()) {
    return EMPTY_RICH_TEXT_DOCUMENT;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isRichTextDocument(parsed) ? parsed : EMPTY_RICH_TEXT_DOCUMENT;
  } catch {
    return EMPTY_RICH_TEXT_DOCUMENT;
  }
}

export function renderRichTextDocumentToSafeHtml(document: JSONContent) {
  const html = generateHTML(document, [StarterKit]);

  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
