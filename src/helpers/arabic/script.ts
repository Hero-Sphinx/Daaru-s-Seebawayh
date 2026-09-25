/**
 * Arabic-script detection — used to skip non-Arabic content in mixed-
 * language book text, both for efficiency (don't send English words to the
 * CAMeL Tools morphological analyzer, which can only ever return empty for
 * them) and correctness (don't force RTL layout on an English-dominant
 * page, don't offer a grammar lookup on a word that isn't Arabic).
 */

// Standard Arabic block + Supplement + Extended-A + Presentation Forms A/B
// (the latter two show up when a PDF embeds pre-shaped glyphs — see
// src/server/services/library/extractPdf.ts's NFKC normalization, which converts most
// of these back to standard Arabic before text is ever stored, but this
// stays defensive in case of upstream text that skipped that step).
const ARABIC_CHAR_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function isArabicWord(word: string): boolean {
  return ARABIC_CHAR_RE.test(word);
}

/** True if at least `threshold` (default half) of the non-whitespace characters in `text` are Arabic script. */
export function isMostlyArabic(text: string, threshold = 0.5): boolean {
  const chars = [...text].filter((c) => !/\s/.test(c));
  if (chars.length === 0) return false;
  const arabicCount = chars.filter((c) => ARABIC_CHAR_RE.test(c)).length;
  return arabicCount / chars.length >= threshold;
}
