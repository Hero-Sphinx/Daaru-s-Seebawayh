// Shared by src/server/lib/auth.ts and src/proxy.ts. Kept in its own module so the
// proxy doesn't import auth.ts and, through it, the Prisma client.
export const SESSION_COOKIE = "dsb_session";

/** A session lives this long after its last use (sliding). */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Options for the session cookie, wherever it's (re)issued. */
export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

/** Reachable without a session. Everything else requires signing in. */
export const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/guide", "/vision"];
