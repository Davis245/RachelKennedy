import { notFound } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type EditablePost = Pick<Database["public"]["Tables"]["posts"]["Row"], "id" | "title" | "status">;

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("posts").select("id, title, status").eq("id", postId).single();

  if (error || !data) {
    notFound();
  }

  const post: EditablePost = data;

  return (
    <section className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)] sm:p-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
          {post.status} post
        </p>
        <h2 className="text-4xl uppercase sm:text-5xl">{post.title}</h2>
        <p className="text-[var(--color-muted)]">
          This edit route is protected and ready for the full post editor in a follow-up issue.
        </p>
      </div>
    </section>
  );
}
