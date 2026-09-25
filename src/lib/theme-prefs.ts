// Shared between the server layout (reads cookies to render the correct
// theme/text scale in the first byte of HTML) and the client SiteHeader
// (writes these same cookies when the user changes a preference).
export const THEME_COOKIE = "allisan-theme";

/**
 * Arabic text scale, in percent — applied to *every* Arabic element (see
 * `.font-arabic` in globals.css), not just the big display lines. A new
 * cookie name: the old one stored an absolute pixel size.
 */
export const ARABIC_SCALE_COOKIE = "dsb-arabic-scale";
export const MIN_ARABIC_SCALE = 80;
export const MAX_ARABIC_SCALE = 160;
export const ARABIC_SCALE_STEP = 10;
export const DEFAULT_ARABIC_SCALE = 100;

export function clampArabicScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_ARABIC_SCALE;
  const stepped = Math.round(value / ARABIC_SCALE_STEP) * ARABIC_SCALE_STEP;
  return Math.min(MAX_ARABIC_SCALE, Math.max(MIN_ARABIC_SCALE, stepped));
}

/**
 * The browser's IANA time zone (e.g. "Africa/Lagos"), remembered so the
 * server can pick day-based content (wisdom of the day) for the user's own
 * date. Written by the client whenever it differs from what's stored.
 */
export const TIMEZONE_COOKIE = "dsb-tz";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function setPrefCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}
