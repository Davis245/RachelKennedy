"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signInAction, type SignInFormState } from "@/app/admin/actions";

const initialState: SignInFormState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ redirectTo = "/admin" }: { redirectTo?: string }) {
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-[0.18em]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.18em]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-11 w-full rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-white px-4 py-3"
        />
      </div>

      {state.message ? (
        <p role="alert" className="rounded-[var(--radius-frame)] border border-[var(--color-accent-coral)] bg-[var(--color-accent-coral-soft)] px-4 py-3 text-sm">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
