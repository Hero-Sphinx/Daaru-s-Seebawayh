import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import db from "@/server/databases/db";
import { realName } from "@/helpers/displayName";
import { sendEmail } from "@/server/lib/email";

/**
 * Password reset by emailed link. The link carries a random 256-bit token;
 * only its SHA-256 is stored (like sessions), it expires after an hour, and
 * it works once. Requesting a new link invalidates older unused ones.
 */

const RESET_TTL_MS = 60 * 60_000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The app's public origin: APP_URL if set, else the request's own host. */
async function appOrigin(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function sendResetLink(user: { id: string; email: string; display_name: string | null }): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  await db.$transaction([
    db.password_reset_tokens.deleteMany({ where: { user_id: user.id, used_at: null } }),
    db.password_reset_tokens.create({ data: { user_id: user.id, token_hash: hashToken(token), expires_at: new Date(Date.now() + RESET_TTL_MS) } }),
  ]);
  const link = `${await appOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
  const name = realName(user.display_name);
  const greeting = name ? `Assalamu 'alaykum wa rahmatullahi wa barakatuh, ${name}` : "Assalamu 'alaykum wa rahmatullahi wa barakatuh";
  await sendEmail({
    to: user.email,
    subject: "Reset your Daaru-s-Seebawayh password",
    text: [
      `${greeting},`,
      "",
      `We received a request to reset the password for your Daaru-s-Seebawayh account (${user.email}).`,
      "To choose a new password, open this link within the next hour:",
      "",
      link,
      "",
      "If you didn't ask for this, you can safely ignore this email — your password won't change.",
      "",
      "Wassalam,",
      "Daaru-s-Seebawayh",
    ].join("\n"),
    html: resetEmailHtml(greeting, user.email, link),
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Inline-styled (email clients ignore stylesheets), in the app's green and gold. */
function resetEmailHtml(greeting: string, email: string, link: string): string {
  const safeLink = escapeHtml(link);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f0e6;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#23201b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0e6;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d7">
        <tr><td style="background:#064e3b;background-image:linear-gradient(90deg,#064e3b,#065f46,#134e4a);padding:24px 28px;color:#ffffff">
          <div style="font-size:26px;font-weight:bold;font-family:Amiri,'Traditional Arabic',serif;direction:rtl;text-align:right;color:#fcd34d">دَارُ سِيبَوَيْهِ</div>
          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#a7f3d0;margin-top:4px">Daaru-s-Seebawayh</div>
        </td></tr>
        <tr><td style="padding:28px">
          <p style="margin:0 0 16px;font-size:16px">${escapeHtml(greeting)},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6">We received a request to reset the password for your account (<strong>${escapeHtml(email)}</strong>). To choose a new password, press the button below within the next hour.</p>
          <p style="margin:24px 0;text-align:center">
            <a href="${safeLink}" style="display:inline-block;background:#f59e0b;color:#022c22;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:12px">Choose a new password</a>
          </p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#6b645a">If the button doesn't work, copy this link into your browser:<br><a href="${safeLink}" style="color:#1f4d3a;word-break:break-all">${safeLink}</a></p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6b645a">If you didn't ask for this, you can safely ignore this email — your password won't change.</p>
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #e7e2d7;font-size:12px;color:#6b645a">Wassalam — Daaru-s-Seebawayh</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** The user a live, unused token belongs to — or null. */
export async function findResetToken(token: string): Promise<{ id: string; user_id: string } | null> {
  if (!token) return null;
  return db.password_reset_tokens.findFirst({
    where: { token_hash: hashToken(token), used_at: null, expires_at: { gt: new Date() } },
    select: { id: true, user_id: true },
  });
}

/**
 * Sets the new password, burns the token, signs the account out everywhere,
 * and lifts any sign-in lockout on it. Returns the account's email.
 */
export async function completeReset(tokenId: string, userId: string, passwordHash: string): Promise<string> {
  const [user] = await db.$transaction([
    db.users.update({ where: { id: userId }, data: { password_hash: passwordHash }, select: { email: true } }),
    db.password_reset_tokens.update({ where: { id: tokenId }, data: { used_at: new Date() } }),
    db.sessions.deleteMany({ where: { user_id: userId } }),
  ]);
  await db.auth_attempts.deleteMany({ where: { kind: "login", bucket: `email:${user.email}` } });
  return user.email;
}
