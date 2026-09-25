import { describe, expect, it } from "vitest";
import { lookupQuranicCorpus, withQuranicCorpusFallback } from "./quranic-corpus";
import quranicCorpusWords from "@/lib/data/quranic-corpus-words.json";
import type { RawCandidate } from "@/lib/irab/free-text-parser";

// Arabic combining diacritics only (tanwin, harakat, shadda, sukun, dagger
// alef) — deliberately NOT a wider range, since the main Arabic letters
// block (U+0621-U+064A) sits directly below U+064B and must stay excluded,
// or "is this a diacritic" would wrongly match real base letters too.
const DIACRITIC_RE = /[ً-ْٰ]/;

function findAdjacentDiacriticPairIndex(text: string): number {
  for (let i = 0; i < text.length - 1; i++) {
    if (DIACRITIC_RE.test(text[i]) && DIACRITIC_RE.test(text[i + 1])) return i;
  }
  return -1;
}

describe("lookupQuranicCorpus", () => {
  it("resolves a Quranic proper noun CAMeL Tools' MSA-only database doesn't cover", () => {
    // Real case verified live: CAMeL Tools returns zero candidates for
    // "ثَمُودَ" (Thamud), a Quranic-specific tribal name with no derivable
    // Arabic root — this corpus fills that gap.
    const candidates = lookupQuranicCorpus("ثَمُودَ");
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]).toMatchObject({ lemma: "ثَمُود", pos: "noun_prop" });
  });

  it("returns nothing for a word not present in the corpus (never fabricates a match)", () => {
    expect(lookupQuranicCorpus("حَاسُوبٌ")).toEqual([]); // "car" — not Quranic vocabulary
  });

  it("is insensitive to diacritic input order, same as CAMeL candidate matching", () => {
    // Pulls a real stored entry with two adjacent combining marks on one
    // letter (rather than hand-typing Arabic combining sequences in source,
    // which is exactly the kind of transcription a byte-for-byte reorder
    // needs to avoid) and swaps their order — same normalizeForMatch rule
    // already covered for CAMeL candidates.
    const entry = (quranicCorpusWords as { diac: string }[]).find((e) => findAdjacentDiacriticPairIndex(e.diac) !== -1);
    expect(entry).toBeDefined();
    const stored = entry!.diac;

    const pairIndex = findAdjacentDiacriticPairIndex(stored);
    const reordered = stored.slice(0, pairIndex) + stored[pairIndex + 1] + stored[pairIndex] + stored.slice(pairIndex + 2);
    expect(reordered).not.toBe(stored);

    const storedCandidates = lookupQuranicCorpus(stored);
    expect(storedCandidates.length).toBeGreaterThan(0);
    expect(lookupQuranicCorpus(reordered)).toEqual(storedCandidates);
  });
});

describe("withQuranicCorpusFallback", () => {
  it("does not merge in a fallback reading for a word CAMeL already exactly matched", () => {
    // Real bug found live: "كَتَبَ" (kataba, "he wrote") is fully covered by
    // CAMeL, but this corpus also has its own entry for it — with a
    // differently-formatted lemma ("كَتَبَ", the actual conjugated
    // occurrence) than CAMeL's ("كَتَب", the bare citation form). Merging
    // both unconditionally made the parser see two "different" verb
    // readings for one exact, unambiguous word and refuse to place it.
    expect(lookupQuranicCorpus("كَتَبَ").length).toBeGreaterThan(0); // corpus really does have its own entry
    const camelCandidates: RawCandidate[] = [{ root: "ك ت ب", lemma: "كَتَب", pos: "verb", diac: "كَتَبَ" }];
    const merged = withQuranicCorpusFallback("كَتَبَ", camelCandidates);
    expect(merged).toEqual(camelCandidates);
  });

  it("merges in the fallback when CAMeL has no exact match at all", () => {
    const merged = withQuranicCorpusFallback("ثَمُودَ", []);
    expect(merged.length).toBeGreaterThan(0);
    expect(merged.every((c) => c.source === "quranic_corpus")).toBe(true);
  });

  it("passes CAMeL's candidates through untouched when neither source matches", () => {
    const camelCandidates: RawCandidate[] = [{ root: "ك ت ب", lemma: "كِتاب", pos: "noun", diac: "كُتُبٌ" }];
    expect(withQuranicCorpusFallback("حَاسُوبٌ", camelCandidates)).toEqual(camelCandidates);
  });
});
