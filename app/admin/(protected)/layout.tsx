import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/admin/actions";
import { ContentContainer } from "@/components/ui/content-container";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function AdminShell({ children, email }: { children: ReactNode; email: string | undefined }) {
  return (
    <main className="py-10 sm:py-12">
      <ContentContainer className="space-y-8">
        <div className="flex flex-col gap-4 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-frame)] sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Admin dashboard
              </p>
              <h1 className="text-4xl uppercase sm:text-5xl">Rachel’s CMS</h1>
            </div>
            <p className="text-sm text-[var(--color-muted)]">{email ? `Signed in as ${email}` : "Signed in"}</p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav
            aria-label="Admin navigation"
            className="h-fit rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-frame)]"
          >
            <ul className="grid gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
              <li>
                <Link href="/admin" className="block rounded-md px-3 py-3 hover:bg-[var(--color-accent-blue-soft)]">
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/comments"
                  className="block rounded-md px-3 py-3 hover:bg-[var(--color-accent-blue-soft)]"
                >
                  Comments
                </Link>
              </li>
            </ul>
          </nav>

          <div className="min-w-0">{children}</div>
        </div>
      </ContentContainer>
    </main>
  );
}

function AccessDenied({ email }: { email: string | undefined }) {
  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="flex justify-center">
        <section className="w-full max-w-2xl space-y-5 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)] sm:p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Access denied
            </p>
            <h1 className="text-4xl uppercase sm:text-5xl">This account is not an administrator</h1>
            <p className="text-[var(--color-muted)]">
              {email
                ? `${email} is signed in, but it is not listed in admin_users.`
                : "This signed-in account is not listed in admin_users."}
            </p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Sign out and switch accounts
            </button>
          </form>
        </section>
      </ContentContainer>
    </main>
  );
}

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error(adminError.message);
  }

  if (!adminUser) {
    return <AccessDenied email={user.email} />;
  }

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
