import { redirect } from "next/navigation";

import { ContentContainer } from "@/components/ui/content-container";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirectTo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams?.redirectTo?.startsWith("/admin")
    ? resolvedSearchParams.redirectTo
    : "/admin";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(redirectTo);
  }

  return (
    <main className="py-12 sm:py-16">
      <ContentContainer className="flex justify-center">
        <section className="w-full max-w-xl space-y-6 rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-frame)] sm:p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Admin
            </p>
            <h1 className="text-4xl uppercase sm:text-5xl">Sign in to Rachel’s CMS</h1>
            <p className="text-[var(--color-muted)]">
              Use the administrator email and password already configured in Supabase Auth.
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />
        </section>
      </ContentContainer>
    </main>
  );
}
