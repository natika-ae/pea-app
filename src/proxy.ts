import type { NextRequest } from "next/server";
import { isAuthPath, isProtectedPath, safeNextPath } from "@/lib/auth/paths";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, signedIn, redirectTo } = await updateSession(request);
  const { pathname, search, searchParams } = request.nextUrl;

  // AU-11: guests opening a members-only page go to /login and come back.
  if (!signedIn && isProtectedPath(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return redirectTo(url);
  }

  // AU-10: signed-in users skip the login and register forms.
  if (signedIn && isAuthPath(pathname)) {
    return redirectTo(
      new URL(safeNextPath(searchParams.get("next")), request.url),
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image optimization.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
