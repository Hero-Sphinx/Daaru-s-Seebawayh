import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUBLIC_PATHS, SESSION_COOKIE } from "@/lib/auth-constants";

/**
 * Optimistic auth gate: only checks that a session cookie is *present*, so
 * it costs no DB round-trip. Whether that session is real and unexpired is
 * decided by src/lib/auth.ts (getCurrentUserId / getApiUserId) wherever
 * user data is read — this layer just turns away obviously-anonymous
 * requests early, and protects pages like /irab that never touch the DAL.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Public pages always pass. (Bouncing signed-in users away from /login is
  // the login page's job, via a *real* session check — doing it here on
  // cookie presence alone would loop forever on a stale/expired cookie:
  // /login -> / -> getCurrentUserId redirects -> /login -> ...)
  if (isPublic || hasSession) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Everything except Next internals and static files (anything with an extension).
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
