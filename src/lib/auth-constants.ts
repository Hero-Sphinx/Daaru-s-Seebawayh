// Shared by src/lib/auth.ts and src/proxy.ts. Kept in its own module so the
// proxy doesn't import auth.ts and, through it, the Prisma client.
export const SESSION_COOKIE = "dsb_session";

/** Reachable without a session. Everything else requires signing in. */
export const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password", "/guide", "/vision"];
