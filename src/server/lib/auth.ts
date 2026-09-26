import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { loginPathFor, REQUEST_PATH_HEADER, SESSION_COOKIE, SESSION_TTL_MS, sessionCookieOptions } from "@/constants";
import { db } from "@/server/databases";

/**
 * Server-side session auth (ROADMAP.md Phase 1). The session cookie holds a
 * random 256-bit token; the `sessions` table stores only its SHA-256 hash,
 * so a leaked database can't be replayed as live logins, and deleting a row
 * is an immediate, real logout (unlike a stateless JWT).
 *
 * Two layers, per the Next.js auth guide:
 * - src/proxy.ts does a cheap *optimistic* check (cookie present?) to
 *   redirect/401 early without a DB round-trip.
 * - This module is the real check (token -> live, unexpired session row),
 *   run by every page and route handler that touches user data.
 */

/** Only push expires_at forward when less than this remains — avoids a DB write on every request. */
const SESSION_REFRESH_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 500) ?? null;

  await db.$transaction([
    // Opportunistic cleanup of this user's dead sessions — no cron needed.
    db.sessions.deleteMany({ where: { user_id: userId, expires_at: { lt: new Date() } } }),
    db.sessions.create({ data: { user_id: userId, token_hash: hashToken(token), user_agent: userAgent, expires_at: expiresAt } }),
    db.users.update({ where: { id: userId }, data: { last_login_at: new Date() } }),
  ]);
  await setSessionCookie(token, expiresAt);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.sessions.deleteMany({ where: { token_hash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * The signed-in user, or null. Wrapped in React's cache() so a page plus
 * its nested server components share one lookup per request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.sessions.findUnique({
    where: { token_hash: hashToken(token) },
    include: { users: { select: { id: true, email: true, display_name: true } } },
  });
  if (!session) return null;

  const now = Date.now();
  if (session.expires_at.getTime() <= now) {
    await db.sessions.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (session.expires_at.getTime() - now < SESSION_REFRESH_THRESHOLD_MS) {
    // Sliding expiry. Only the DB row can be extended here (cookies can't be
    // set while rendering a server component); src/proxy.ts keeps the
    // cookie itself sliding along with it.
    await db.sessions.update({ where: { id: session.id }, data: { expires_at: new Date(now + SESSION_TTL_MS) } });
  }

  return { id: session.users.id, email: session.users.email, displayName: session.users.display_name };
});

/**
 * For pages / server components: the signed-in user's id, or a redirect to
 * /login. The proxy already redirects when there's no cookie at all; this
 * catches an expired or revoked one, and still returns the learner to the
 * page they asked for (the path comes from the proxy, see REQUEST_PATH_HEADER).
 */
export async function getCurrentUserId(): Promise<string> {
  const user = await getSessionUser();
  if (!user) redirect(loginPathFor((await headers()).get(REQUEST_PATH_HEADER)));
  return user.id;
}

/**
 * For route handlers: the signed-in user's id, or null (see withAuth in
 * server/lib/handler.ts). Deliberately not a redirect: API callers are
 * fetch() calls expecting JSON, and a 307 to the login page's HTML would
 * surface as a confusing JSON parse error instead of a clear 401.
 */
export async function getApiUserId(): Promise<string | null> {
  return (await getSessionUser())?.id ?? null;
}
