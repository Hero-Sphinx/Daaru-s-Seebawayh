/**
 * Search normalization for Arabic text: strips harakat, dagger alif, Qur'anic
 * annotation marks and tatweel, and folds hamza-carrying/wasla alifs to a
 * bare alif — so "كِتَاب", "كتاب" and "ٱلْكِتَابِ" compare by letters alone.
 *
 * MUST stay identical to the SQL generated column
 * library_text_units.raw_text_normalized (db/schema.sql): the DB pre-filters
 * with it and this code does the precise matching, so any drift would make
 * matches silently disappear. tests/helpers/arabic/normalize.test.ts pins it.
 */

const STRIP_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const ALIF_FOLD: Record<string, string> = { "\u0623": "\u0627", "\u0625": "\u0627", "\u0622": "\u0627", "\u0671": "\u0627" };
const ALIF_FOLD_RE = /[\u0623\u0625\u0622\u0671]/g;

export function normalizeArabicForSearch(text: string): string {
  return text.replace(STRIP_RE, "").replace(ALIF_FOLD_RE, (c) => ALIF_FOLD[c]);
}

/**
 * Same normalization, plus a map from each normalized character's index
 * back to its index in the original — so a match found in normalized text
 * can be highlighted/snippeted in the original, diacritics intact.
 * (Normalization only deletes or 1:1-replaces characters, so this is exact.)
 */
export function normalizeWithMap(text: string): { normalized: string; toOriginal: number[] } {
  let normalized = "";
  const toOriginal: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/.test(ch)) continue;
    normalized += ALIF_FOLD[ch] ?? ch;
    toOriginal.push(i);
  }
  return { normalized, toOriginal };
}

/**
 * Original-text snippet around [start, end) of the *normalized* text. Ends
 * extend to include trailing diacritics of the last matched letter.
 */
export function snippetAround(
  text: string,
  mapped: { toOriginal: number[] },
  start: number,
  end: number,
  contextChars = 60
): { snippet: string; matchStart: number; matchEnd: number } {
  const origStart = mapped.toOriginal[start];
  // toOriginal[end] is the next *kept* char; everything before it (the last letter's marks) belongs to the match.
  const origEnd = end < mapped.toOriginal.length ? mapped.toOriginal[end] : text.length;
  const from = Math.max(0, origStart - contextChars);
  const to = Math.min(text.length, origEnd + contextChars);
  const prefix = from > 0 ? "\u2026" : "";
  return {
    snippet: prefix + text.slice(from, to) + (to < text.length ? "\u2026" : ""),
    matchStart: prefix.length + (origStart - from),
    matchEnd: prefix.length + (origEnd - from),
  };
}
