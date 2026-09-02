export type PublicSupabaseEnv = Readonly<{
  url: string;
  publishableKey: string;
}>;

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireUrlEnv(name: "NEXT_PUBLIC_SUPABASE_URL") {
  const value = requireEnv(name);

  try {
    new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  return value;
}

export function hasPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  return {
    url: requireUrlEnv("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}
