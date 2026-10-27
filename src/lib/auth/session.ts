import "server-only";
import { connection } from "next/server";
import { cache } from "react";
import { supabaseEnv } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; name: string };

/**
 * The signed-in user, or null. Reads cookies, so render it behind <Suspense>.
 * getClaims() verifies the JWT; never trust getSession() on the server.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Always request-time, even when env is missing at build time; otherwise
  // the signed-out menu would be baked into the static shell.
  await connection();
  if (!supabaseEnv()) return null;

  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  // user_metadata is user-editable: fine for display, never for authorization.
  const fullName = claims.user_metadata?.full_name;
  return {
    id: claims.sub,
    name: typeof fullName === "string" ? fullName : (claims.email ?? ""),
  };
});
