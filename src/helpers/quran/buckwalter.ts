/**
 * Extended Buckwalter -> Arabic, as used by the Quranic Arabic Corpus
 * (JQuranTree's scheme: https://corpus.quran.com/java/buckwalter.jsp).
 *
 * Plain Buckwalter plus 14 extra ASCII symbols for Uthmani marks (maddah,
 * hamza-above, small high/low letters, pause marks). Two decoders, for two
 * different jobs:
 *
 * - toArabic(): faithful — every mark kept. For displaying the Qur'anic
 *   text itself, where dropping a recitation mark would misprint the verse.
 * - toArabicLexical(): drops the Uthmani-only marks first. For dictionary
 *   keys (lemmas, roots), matching services/camel/scripts/import_quranic_corpus.py
 *   so DB lemmas line up with the bundled quranic-corpus-words.json and
 *   with what a learner would actually type.
 */

const BASE_MAP: Record<string, string> = {
  "'": "ء", // ء
  "|": "\u0622", // آ
  ">": "\u0623", // أ
  "&": "\u0624", // ؤ
  "<": "\u0625", // إ
  "}": "\u0626", // ئ
  A: "\u0627",
  b: "\u0628",
  p: "\u0629",
  t: "\u062A",
  v: "\u062B",
  j: "\u062C",
  H: "\u062D",
  x: "\u062E",
  d: "\u062F",
  "*": "\u0630",
  r: "\u0631",
  z: "\u0632",
  s: "\u0633",
  $: "\u0634",
  S: "\u0635",
  D: "\u0636",
  T: "\u0637",
  Z: "\u0638",
  E: "\u0639",
  g: "\u063A",
  _: "\u0640", // tatweel
  f: "\u0641",
  q: "\u0642",
  k: "\u0643",
  l: "\u0644",
  m: "\u0645",
  n: "\u0646",
  h: "\u0647",
  w: "\u0648",
  Y: "\u0649",
  y: "\u064A",
  F: "\u064B", // fathatan
  N: "\u064C", // dammatan
  K: "\u064D", // kasratan
  a: "\u064E",
  u: "\u064F",
  i: "\u0650",
  "~": "\u0651", // shadda
  o: "\u0652", // sukun
  "`": "\u0670", // superscript (dagger) alif
  "{": "\u0671", // alif wasla
  // One corpus "word" is written in two parts: إِلْ يَاسِينَ (37:130).
  " ": " ",
};

/** The extended scheme's Uthmani-only marks. */
const EXTENDED_MAP: Record<string, string> = {
  "^": "\u0653", // maddah above
  "#": "\u0654", // hamza above
  ":": "\u06DC", // small high seen
  "@": "\u06DF", // small high rounded zero
  '"': "\u06E0", // small high upright rectangular zero
  "[": "\u06E2", // small high meem isolated form
  ";": "\u06E3", // small low seen
  ",": "\u06E5", // small waw
  ".": "\u06E6", // small ya
  "!": "\u06E8", // small high noon
  "-": "\u06EA", // empty centre low stop
  "+": "\u06EB", // empty centre high stop
  "%": "\u06EC", // rounded high stop with filled centre
  "]": "\u06ED", // small low meem
};

const FULL_MAP: Record<string, string> = { ...BASE_MAP, ...EXTENDED_MAP };

export class UnknownBuckwalterCharError extends Error {}

function decode(input: string, map: Record<string, string>, skip: Record<string, string> | null): string {
  let out = "";
  for (const ch of input) {
    if (skip && ch in skip) continue;
    const mapped = map[ch];
    // Fail loudly: silently passing an unknown symbol through is exactly how
    // a stray "^" ended up inside decoded Arabic before (see the Python importer).
    if (mapped === undefined) throw new UnknownBuckwalterCharError(`Unknown Buckwalter character ${JSON.stringify(ch)} in ${JSON.stringify(input)}`);
    out += mapped;
  }
  // Canonical (NFC) mark order — e.g. fatha before shadda — so stored text
  // compares equal to what a learner types, whatever order the source used.
  return out.normalize("NFC");
}

export function toArabic(buckwalter: string): string {
  return decode(buckwalter, FULL_MAP, null);
}

export function toArabicLexical(buckwalter: string): string {
  return decode(buckwalter, BASE_MAP, EXTENDED_MAP);
}

/** Corpus roots are bare consonants ("ktb"); this app's convention (matching CAMeL Tools) is space-separated ("ك ت ب"). */
export function rootToArabic(buckwalterRoot: string): string {
  return [...toArabicLexical(buckwalterRoot)].join(" ");
}

const DIACRITICS_AND_MARKS_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

/**
 * Undiacritized "simple" text for search: harakat, dagger alif, Uthmani
 * marks and tatweel removed; alif wasla folded to plain alif.
 */
export function toSimpleArabic(arabic: string): string {
  return arabic.replace(DIACRITICS_AND_MARKS_RE, "").replace(/\u0671/g, "\u0627");
}
