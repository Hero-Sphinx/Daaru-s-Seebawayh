import { normalizeArabicForSearch, normalizeWithMap } from "@/lib/arabic-normalize";

/**
 * Root-aware library search (ROADMAP.md Phase 5). Library text isn't
 * morphologically tokenized, so instead of analysing every book word, we
 * go the other way: take every form of the root *attested in the Qur'an*
 * (imported QADT tokens) and look for those forms in the text — whole
 * words, plus the stem after peeling the common attached prefixes
 * (و/ف, then ب/ل/ك, then ال).
 *
 * Deliberately conservative: a form the Qur'an never uses (e.g. modern
 * مكتبة "library" for ك ت ب) is not found. That's a stated limitation,
 * not a guess — no fuzzy stemming that would also "find" unrelated words.
 */

export interface RootFormIndex {
  /** Full word forms (clitics included) as they occur in the Qur'an, normalized. */
  wholeForms: Set<string>;
  /** Bare stems (no clitics), normalized — matched after prefix stripping. */
  stems: Set<string>;
}

/**
 * The two standard-orthography spellings of an Uthmani form: dagger alif
 * written out (كِتَٰب -> كتاب) and dropped (رَحْمَٰن -> رحمن), both normalized.
 */
export function spellingVariants(uthmani: string): string[] {
  const nfc = uthmani.normalize("NFC");
  const writtenOut = nfc.replace(/\u0649\u0670/g, "\u0649").replace(/\u0670/g, "\u0627");
  return [...new Set([normalizeArabicForSearch(writtenOut), normalizeArabicForSearch(nfc)])].filter(Boolean);
}

/** Minimum stem length to match on — 1-letter stems (e.g. the imperative قِ) would match noise. */
const MIN_STEM_LENGTH = 2;

export function buildRootFormIndex(wordSurfaces: string[], stemSurfaces: string[]): RootFormIndex {
  const wholeForms = new Set(wordSurfaces.flatMap(spellingVariants));
  const stems = new Set(stemSurfaces.flatMap(spellingVariants).filter((s) => s.length >= MIN_STEM_LENGTH));
  return { wholeForms, stems };
}

/** Candidate stems of a normalized word after peeling attached prefixes. */
export function peelPrefixes(word: string): string[] {
  const out = new Set<string>([word]);
  let layer = [word];
  // Layers: conjunctions (wa, fa), then prepositions (bi, li, ka).
  for (const prefixes of [["\u0648", "\u0641"], ["\u0628", "\u0644", "\u0643"]]) {
    const next: string[] = [];
    for (const w of layer) {
      for (const p of prefixes) if (w.startsWith(p) && w.length > p.length + 1) next.push(w.slice(p.length));
    }
    layer = [...layer, ...next];
    next.forEach((w) => out.add(w));
  }
  for (const w of [...out]) {
    if (w.startsWith("ال") && w.length > 3) out.add(w.slice(2));
    // ل + ال contracts to لل (للكتاب = لِ + الكتاب): after peeling ل, a leading ل is the article.
    if (w.startsWith("لل") && w.length > 3) out.add(w.slice(2));
  }
  return [...out];
}

/**
 * Attached suffixes, longest first: verb agreement endings and object/
 * possessive pronouns. Only one layer is peeled — enough for اكتبوا ->
 * اكتب or كتابهم -> كتاب — and a match still requires the remainder to be an
 * attested form of *this* root, so this can't pull in unrelated words.
 */
const SUFFIXES = ["تموه", "هما", "كما", "تما", "تم", "تن", "وا", "ون", "ين", "ان", "ات", "نا", "ها", "هم", "هن", "كم", "كن", "ه", "ك", "ي", "ت", "ن"];

/** Candidates for a word with one suffix peeled (never below 2 letters). */
export function peelSuffixes(word: string): string[] {
  return SUFFIXES.filter((sfx) => word.endsWith(sfx) && word.length - sfx.length >= 2).map((sfx) => word.slice(0, -sfx.length));
}

export function wordMatchesRoot(normalizedWord: string, index: RootFormIndex): boolean {
  if (index.wholeForms.has(normalizedWord)) return true;
  const hit = (c: string) => index.stems.has(c) || index.wholeForms.has(c);
  return peelPrefixes(normalizedWord).some((c) => hit(c) || peelSuffixes(c).some(hit));
}

const ARABIC_WORD_RE = /[\u0621-\u064A\u0671-\u06D3]+/g;

export interface RootMatch {
  /** Offsets in the *normalized* text. */
  start: number;
  end: number;
  word: string;
}

/** Every word in `text` (original, possibly diacritized) that is a form of the indexed root. */
export function findRootMatches(text: string, index: RootFormIndex): { matches: RootMatch[]; mapped: ReturnType<typeof normalizeWithMap> } {
  const mapped = normalizeWithMap(text);
  const matches: RootMatch[] = [];
  for (const m of mapped.normalized.matchAll(ARABIC_WORD_RE)) {
    if (wordMatchesRoot(m[0], index)) matches.push({ start: m.index!, end: m.index! + m[0].length, word: m[0] });
  }
  return { matches, mapped };
}

/** Is `input` written as a root — single letters separated by spaces/dots/dashes (ك ت ب, ك.ت.ب, ك-ت-ب)? */
export function parseRootInput(input: string): string | null {
  const letters = normalizeArabicForSearch(input.trim()).split(/[\s.\-\u060C,]+/).filter(Boolean);
  if (letters.length >= 3 && letters.length <= 4 && letters.every((l) => /^[ء-ي]$/.test(l))) return letters.join(" ");
  return null;
}
