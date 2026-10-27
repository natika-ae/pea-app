// Redirect rules for spec 003 (BR-07, AU-10, AU-11).

/** Pages that need a signed-in user. Guests are sent to /login?next=… */
const PROTECTED_PATHS = ["/my-courses"];
const AUTH_PATHS = ["/login", "/register"];

function matches(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isProtectedPath(pathname: string): boolean {
  return matches(pathname, PROTECTED_PATHS);
}

export function isAuthPath(pathname: string): boolean {
  return matches(pathname, AUTH_PATHS);
}

/**
 * Returns `next` if it is a path inside this site, otherwise "/" (BR-07).
 * /login and /register also fall back to "/" so the user doesn't land back
 * on a form they just finished.
 */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/")) return "/";
  // "//host" and "/\host" are protocol-relative URLs in browsers.
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";

  // The URL parser strips tabs/newlines and resolves "..", the same way a
  // browser would, so the origin check catches anything that escapes.
  const base = "http://localhost";
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return "/";
  }
  if (url.origin !== base || isAuthPath(url.pathname)) return "/";

  const path = `${url.pathname}${url.search}${url.hash}`;
  // Dot segments can collapse to "//host", e.g. "/.//evil.example.com".
  return path.startsWith("//") ? "/" : path;
}

/** Query string carrying `next` to the other auth page, or "" if unsafe. */
export function nextQuery(next: unknown): string {
  const path = safeNextPath(next);
  return path === "/" ? "" : `?${new URLSearchParams({ next: path })}`;
}
