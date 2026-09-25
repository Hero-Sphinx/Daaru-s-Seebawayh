import { normalizeForMatch } from "@/helpers/irab/normalize";

/**
 * Matches a learner-typed word against the Qur'an lemma dictionary
 * (lemmas imported by scripts/import-quran.ts), so a vocabulary item can be
 * linked to its dictionary entry (vocabulary_items.lemma_id) — root family,
 * corpus frequency, same-root quiz distractors.
 *
 * Conservative by design: returns a lemma only when exactly ONE candidate
 * survives. An ambiguous word (كتب: verb "wrote" or plural noun "books")
 * stays unlinked rather than being linked to a guess.
 */

export interface LemmaCandidate {
  id: string;
  lemmaAr: string;
  rootLetters: string | null;
  /** Corpus frequency rank (1 = most frequent); tie-breaker for same-headword entries. */
  frequencyRank?: number | null;
}

const DAGGER_ALIF = "\u0670";
const ALIF_MAQSURA = "\u0649";
const HARAKAT_RE = /[\u064B-\u065F\u06D6-\u06ED\u0640]/g;

/**
 * Uthmani -> standard spelling for comparison: dagger alif becomes a full
 * alif (كِتَٰب ~ كِتَاب), except after alif maqsura where standard spelling
 * simply drops it (عَلَىٰ ~ عَلَى); alif wasla becomes plain alif.
 */
function toStandardSpelling(text: string): string {
  return text
    .normalize("NFC")
    .replace(new RegExp(`${ALIF_MAQSURA}${DAGGER_ALIF}`, "g"), ALIF_MAQSURA)
    .replace(new RegExp(`([\\u064B-\\u0652]*)${DAGGER_ALIF}`, "g"), "$1ا")
    .replace(/\u0671/g, "\u0627");
}

/** Bare key: standard spelling, no diacritics, hamza-carrying alifs folded to ا. */
export function bareLemmaKey(text: string): string {
  return toStandardSpelling(text).replace(HARAKAT_RE, "").replace(/[\u0622\u0623\u0625]/g, "\u0627").trim();
}

function hasDiacritics(text: string): boolean {
  return /[\u064B-\u0652]/.test(text);
}

/**
 * Standard orthography isn't consistent about the dagger alif: most words
 * write it out (كِتَٰب -> كتاب) but a few classic ones drop it (رَحْمَٰن ->
 * رحمن, هَٰذَا -> هذا). So each lemma is indexed under both spellings.
 */
function lemmaKeys(lemmaAr: string): Set<string> {
  return new Set([bareLemmaKey(lemmaAr), bareLemmaKey(lemmaAr.normalize("NFC").replaceAll(DAGGER_ALIF, ""))]);
}

export function buildLemmaIndex(lemmas: LemmaCandidate[]): Map<string, LemmaCandidate[]> {
  const index = new Map<string, LemmaCandidate[]>();
  for (const l of lemmas) {
    for (const key of lemmaKeys(l.lemmaAr)) {
      const bucket = index.get(key);
      if (bucket) bucket.push(l);
      else index.set(key, [l]);
    }
  }
  return index;
}

export function matchLemma(index: Map<string, LemmaCandidate[]>, wordAr: string, root?: string | null): LemmaCandidate | null {
  let candidates = index.get(bareLemmaKey(wordAr)) ?? [];

  if (root?.trim()) {
    const wantedRoot = root.replace(/[\s.\-\u060C,]/g, "");
    candidates = candidates.filter((c) => c.rootLetters?.replace(/\s/g, "") === wantedRoot);
  }
  if (candidates.length > 1 && hasDiacritics(wordAr)) {
    const typed = normalizeForMatch(toStandardSpelling(wordAr));
    candidates = candidates.filter((c) => normalizeForMatch(toStandardSpelling(c.lemmaAr)) === typed);
  }
  if (candidates.length === 1) return candidates[0];

  // The corpus sometimes lists one headword under two POS tags (فَصْل as
  // both noun and adjective). Same spelling + same root is the same
  // dictionary word for a vocabulary link, so take the more frequent entry;
  // anything that differs in spelling or root stays ambiguous -> null.
  const [first] = candidates;
  const sameHeadword =
    candidates.length > 1 &&
    candidates.every((c) => c.lemmaAr.normalize("NFC") === first.lemmaAr.normalize("NFC") && c.rootLetters === first.rootLetters);
  if (!sameHeadword) return null;
  return candidates.reduce((best, c) => ((c.frequencyRank ?? Infinity) < (best.frequencyRank ?? Infinity) ? c : best));
}
