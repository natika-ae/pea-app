import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "./env";

/**
 * Client that acts as the current user, with the session in cookies.
 * Create a new one per request; don't keep it in a module variable.
 */
export async function createSessionClient() {
  const { url, publishableKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components can't set cookies. The proxy refreshes the
          // session, so this is safe to ignore.
        }
      },
    },
  });
}

/** Client with the secret key. Bypasses RLS: server code only. */
export function createAdminClient() {
  const { url, secretKey } = requireSupabaseEnv();
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
