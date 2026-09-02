import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type AdminPostOverview = Pick<
  Database["public"]["Tables"]["posts"]["Row"],
  "id" | "status" | "title" | "location" | "updated_at"
>;

function formatUpdatedDate(updatedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(updatedAt));
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, status, title, location, updated_at")
    .order("updated_at", { ascending: false });
  const posts: AdminPostOverview[] | null = data;

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">Posts</p>
        <h2 className="text-4xl uppercase sm:text-5xl">Overview</h2>
        <p className="text-[var(--color-muted)]">
          Review draft and published travel stories before opening the editor.
        </p>
      </div>

      {error ? (
        <div className="rounded-[var(--radius-frame)] border border-[var(--color-accent-coral)] bg-[var(--color-accent-coral-soft)] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Unable to load posts</p>
          <p className="mt-2 text-sm">{error.message}</p>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="overflow-x-auto rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-frame)]">
          <table className="min-w-full border-collapse">
            <caption className="sr-only">Posts overview</caption>
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                <th scope="col" className="px-4 py-3 sm:px-5">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 sm:px-5">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 sm:px-5">
                  Location
                </th>
                <th scope="col" className="px-4 py-3 sm:px-5">
                  Updated
                </th>
                <th scope="col" className="px-4 py-3 sm:px-5">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[var(--color-border)] last:border-b-0">
                  <td className="px-4 py-4 align-top sm:px-5">
                    <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent-blue-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)]">
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <span className="font-semibold">{post.title}</span>
                  </td>
                  <td className="px-4 py-4 align-top text-[var(--color-muted)] sm:px-5">
                    {post.location || "No location"}
                  </td>
                  <td className="px-4 py-4 align-top text-[var(--color-muted)] sm:px-5">
                    {formatUpdatedDate(post.updated_at)}
                  </td>
                  <td className="px-4 py-4 align-top sm:px-5">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="inline-flex min-h-11 items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] hover:bg-[var(--color-accent-blue-soft)]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">No posts yet</p>
          <p className="mt-2 text-[var(--color-muted)]">
            Draft and published travel stories will appear here once Rachel creates them.
          </p>
        </div>
      )}
    </section>
  );
}
