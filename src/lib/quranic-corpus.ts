/**
 * Deterministic fallback root/lemma/POS lookup for classical/Quranic
 * vocabulary that CAMeL Tools' MSA-only database doesn't cover (see the
 * proper-noun case-ending gap this was built to follow up on). Sourced from
 * the Quranic Arabic Corpus — see data/quranic-corpus/NOTICE.md for
 * provenance/license and services/camel/scripts/import_quranic_corpus.py
 * for how src/lib/data/quranic-corpus-words.json was generated.
 *
 * Deliberately NOT a live query source (unlike CAMeL Tools, which is
 * queried over HTTP) — this is a static, bundled reference dataset, so a
 * simple in-memory lookup loaded once is the right complexity for it; no
 * network call, no service to keep running.
 */

import quranicCorpusWords from "@/lib/data/quranic-corpus-words.json";
import { candidateMatchesSurface, normalizeForMatch } from "@/lib/irab/normalize";
import type { RawCandidate } from "@/lib/irab/free-text-parser";

export interface QuranicCorpusCandidate {
  root: string | null;
  lemma: string | null;
  pos: string | null;
  diac: string | null;
}

let indexByNormalizedForm: Map<string, QuranicCorpusCandidate[]> | null = null;

function getIndex(): Map<string, QuranicCorpusCandidate[]> {
  if (indexByNormalizedForm) return indexByNormalizedForm;
  const index = new Map<string, QuranicCorpusCandidate[]>();
  for (const entry of quranicCorpusWords as QuranicCorpusCandidate[]) {
    if (!entry.diac) continue;
    const key = normalizeForMatch(entry.diac);
    const bucket = index.get(key);
    if (bucket) bucket.push(entry);
    else index.set(key, [entry]);
  }
  indexByNormalizedForm = index;
  return index;
}

/** Candidates whose diac, once normalized, matches `surface` exactly (same normalization used for CAMeL candidates). */
export function lookupQuranicCorpus(surface: string): QuranicCorpusCandidate[] {
  return getIndex().get(normalizeForMatch(surface)) ?? [];
}

/**
 * Merges in the Quranic Arabic Corpus fallback for a word — but only when
 * `camelCandidates` has no exact match at all for `surface`.
 *
 * This exclusivity is load-bearing, not a nicety: the two sources cite verb
 * lemmas differently (CAMeL's bare citation form vs. this corpus's actual
 * conjugated occurrence — e.g. "كَتَب" vs "كَتَبَ" for the same root, same
 * word, same POS). Merging both whenever CAMeL already had a match caused a
 * real bug — a word CAMeL covered perfectly picked up a second, spurious
 * "reading" that differed only in lemma formatting, which the parser then
 * read as genuine root ambiguity and refused to place in the sentence at
 * all. See src/lib/irab/free-text-parser.test.ts for the regression case.
 */
export function withQuranicCorpusFallback(surface: string, camelCandidates: RawCandidate[]): RawCandidate[] {
  const camelHasExactMatch = camelCandidates.some((c) => c.diac !== null && candidateMatchesSurface(c.diac, surface));
  if (camelHasExactMatch) return camelCandidates;
  const fallback: RawCandidate[] = lookupQuranicCorpus(surface).map((c) => ({ ...c, source: "quranic_corpus" }));
  return [...camelCandidates, ...fallback];
}
