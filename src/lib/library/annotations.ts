/** Pure helpers for library annotations (highlight + note). */

export const MAX_NOTE_LENGTH = 4000;
export const MAX_QUOTE_LENGTH = 2000;

export interface AnnotationDTO {
  id: string;
  textUnitId: number;
  pageNumber: number | null;
  start: number;
  end: number;
  quote: string;
  note: string | null;
  visibility: "private" | "shared";
  authorName: string;
  mine: boolean;
  createdAt: string;
}

/**
 * Validates a [start, end) selection against the page text it claims to
 * cover and returns the exact quote, or an error message. Trims surrounding
 * whitespace off the selection (a drag usually grabs a stray space) and
 * never splits a UTF-16 surrogate pair.
 */
export function resolveAnnotationRange(
  text: string,
  start: unknown,
  end: unknown
): { ok: true; start: number; end: number; quote: string } | { ok: false; error: string } {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return { ok: false, error: "start and end must be integers" };
  let s = start as number;
  let e = end as number;
  if (s < 0 || e > text.length || e <= s) return { ok: false, error: "Selection is outside this page's text" };

  while (s < e && /\s/.test(text[s])) s++;
  while (e > s && /\s/.test(text[e - 1])) e--;
  if (e <= s) return { ok: false, error: "Select some text first" };
  if (e - s > MAX_QUOTE_LENGTH) return { ok: false, error: `Highlight at most ${MAX_QUOTE_LENGTH} characters` };

  const isLowSurrogate = (i: number) => i < text.length && text.charCodeAt(i) >= 0xdc00 && text.charCodeAt(i) <= 0xdfff;
  if (isLowSurrogate(s) || isLowSurrogate(e)) return { ok: false, error: "Selection splits a character" };

  return { ok: true, start: s, end: e, quote: text.slice(s, e) };
}

/** Does [aStart, aEnd) overlap [bStart, bEnd)? — used to highlight words that fall inside a note. */
export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}
