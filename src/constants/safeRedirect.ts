/**
 * Post-login redirect target from an untrusted `?next=` value. Only
 * same-origin absolute paths pass; anything else ("//evil.com",
 * "https://evil.com", "/\\evil.com", "javascript:...") falls back to "/", so
 * the login form can't be turned into an open redirect.
 */
export function safeNextPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (/[\u0000-\u001f]/.test(raw)) return "/";
  return raw;
}
