import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  loginPathFor,
  PUBLIC_PATHS,
  REQUEST_PATH_HEADER,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "@/constants/auth";

/**
 * Optimistic auth gate: only checks that a session cookie is *present*, so
 * it costs no DB round-trip. Whether that session is real and unexpired is
 * decided by src/server/lib/auth.ts (getCurrentUserId / getApiUserId) wherever
 * user data is read — this layer just turns away obviously-anonymous
 * requests early, and protects pages like /irab that never touch the DAL.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isApi = pathname.startsWith("/api/");

  if (session) {
    // Slide the cookie along with the DB session (see getSessionUser), so an
    // active learner isn't signed out 30 days after their last *sign-in*.
    // Harmless for a stale cookie: the DB row is what's actually enforced.
    // Page loads only (GET): never on an API call, and never on a POST —
    // server actions like sign-out set or clear this cookie themselves, and
    // a second Set-Cookie from here could undo that.
    // The cookie may still be stale, in which case getCurrentUserId sends the
    // page to /login. Pass the path along so it can come back here after
    // signing in. Always overwritten, so a client can't supply its own.
    const requestHeaders = new Headers(request.headers);
    if (isApi) requestHeaders.delete(REQUEST_PATH_HEADER);
    else requestHeaders.set(REQUEST_PATH_HEADER, `${pathname}${search}`);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    if (request.method === "GET" && !isApi) {
      response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions(new Date(Date.now() + SESSION_TTL_MS)));
    }
    return response;
  }

  // Public pages always pass. (Bouncing signed-in users away from /login is
  // the login page's job, via a *real* session check — doing it here on
  // cookie presence alone would loop forever on a stale/expired cookie:
  // /login -> / -> getCurrentUserId redirects -> /login -> ...)
  if (isPublic) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.redirect(new URL(loginPathFor(`${pathname}${search}`), request.url));
}

export const config = {
  matcher: [
    // Everything except Next internals and static files (anything with an extension).
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
