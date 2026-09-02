import { PostEditor } from "@/components/admin/post-editor";
import { EMPTY_RICH_TEXT_DOCUMENT } from "@/lib/rich-text";

export default function AdminNewPostPage() {
  return (
    <PostEditor
      mode="create"
      initialData={{
        title: "",
        slug: "",
        excerpt: "",
        location: "",
        country: "",
        travelStartDate: "",
        travelEndDate: "",
        coverImageUrl: "",
        coverImageAlt: "",
        galleryImages: [],
        content: EMPTY_RICH_TEXT_DOCUMENT,
        status: "draft",
      }}
    />
  );
}
