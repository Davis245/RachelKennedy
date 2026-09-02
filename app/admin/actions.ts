"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SignInFormState = {
  message: string;
};

const DEFAULT_SIGN_IN_STATE: SignInFormState = {
  message: "",
};

function getSafeAdminRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/admin";
  }

  return value.startsWith("/admin") ? value : "/admin";
}

export async function signInAction(
  previousState: SignInFormState = DEFAULT_SIGN_IN_STATE,
  formData: FormData,
): Promise<SignInFormState> {
  void previousState;

  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = getSafeAdminRedirect(formData.get("redirectTo"));

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return {
      message: "Enter both your email address and password.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return {
      message: error.message || "Unable to sign in with that email and password.",
    };
  }

  redirect(redirectTo);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();

  redirect("/admin/login");
}
