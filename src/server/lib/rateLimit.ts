import { headers } from "next/headers";
import db from "@/server/databases/db";

/**
 * Database-backed rate limiting for sign-in and password-reset requests —
 * works across serverless instances with no extra service. Each *failed*
 * attempt is a row in auth_attempts; a request is refused while a bucket
 * (the email being tried, or the client's IP) has too many recent rows.
 *
 * Limits are deliberately generous for real people (a few typos) and
 * useless for guessing: 5 wrong passwords per account and 20 per IP in 15
 * minutes gives an attacker ~480 guesses a day per account at best, against
 * passwords of 8+ characters hashed with scrypt.
 */

export type AttemptKind = "login" | "reset";

interface Limit {
  max: number;
  windowMs: number;
}

export const LIMITS: Record<AttemptKind, { perEmail: Limit; perIp: Limit }> = {
  login: { perEmail: { max: 5, windowMs: 15 * 60_000 }, perIp: { max: 20, windowMs: 15 * 60_000 } },
  reset: { perEmail: { max: 3, windowMs: 60 * 60_000 }, perIp: { max: 10, windowMs: 60 * 60_000 } },
};

/** The client's address as the proxy/CDN reports it (first hop of x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function buckets(email: string, ip: string) {
  return { email: `email:${email}`, ip: `ip:${ip}` };
}

/** Minutes until the caller may try again, or 0 when not limited. */
export async function retryAfterMinutes(kind: AttemptKind, email: string, ip: string): Promise<number> {
  const b = buckets(email, ip);
  const lim = LIMITS[kind];
  const check = async (bucket: string, { max, windowMs }: Limit) => {
    const since = new Date(Date.now() - windowMs);
    const recent = await db.auth_attempts.findMany({
      where: { kind, bucket, created_at: { gte: since } },
      orderBy: { created_at: "asc" },
      select: { created_at: true },
    });
    if (recent.length < max) return 0;
    // Free again once the oldest attempt still inside the window ages out.
    const freeAt = recent[recent.length - max].created_at.getTime() + windowMs;
    return Math.max(1, Math.ceil((freeAt - Date.now()) / 60_000));
  };
  const [byEmail, byIp] = await Promise.all([check(b.email, lim.perEmail), check(b.ip, lim.perIp)]);
  return Math.max(byEmail, byIp);
}

export async function recordAttempt(kind: AttemptKind, email: string, ip: string): Promise<void> {
  const b = buckets(email, ip);
  const oldest = new Date(Date.now() - 24 * 60 * 60_000);
  await db.$transaction([
    // Opportunistic cleanup — no cron needed.
    db.auth_attempts.deleteMany({ where: { created_at: { lt: oldest } } }),
    db.auth_attempts.createMany({ data: [{ kind, bucket: b.email }, { kind, bucket: b.ip }] }),
  ]);
}

/** A successful sign-in clears that account's failures (not the IP's). */
export async function clearAttempts(kind: AttemptKind, email: string): Promise<void> {
  await db.auth_attempts.deleteMany({ where: { kind, bucket: `email:${email}` } });
}
