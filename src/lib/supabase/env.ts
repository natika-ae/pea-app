// Supabase settings. None of these use the NEXT_PUBLIC_ prefix: all auth
// calls go through the server, so the browser never talks to Supabase
// directly and can't bypass the lockout in spec 003 BR-06.

export function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function requireSupabaseEnv() {
  const env = supabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!env || !secretKey) {
    throw new Error(
      "Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY in .env.local",
    );
  }
  return { ...env, secretKey };
}
