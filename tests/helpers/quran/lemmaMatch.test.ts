import { describe, expect, it } from "vitest";
import { bareLemmaKey, buildLemmaIndex, matchLemma, type LemmaCandidate } from "@/helpers/quran/lemmaMatch";

// Real lemma spellings from the imported corpus (Uthmani).
const LEMMAS: LemmaCandidate[] = [
  { id: "47", lemmaAr: "كِتَٰب", rootLetters: "ك ت ب" },
  { id: "231", lemmaAr: "كَتَبَ", rootLetters: "ك ت ب" },
  { id: "900", lemmaAr: "كُتُب", rootLetters: "ك ت ب" },
  { id: "12", lemmaAr: "عَلَىٰ", rootLetters: null },
  { id: "2", lemmaAr: "ٱللَّه", rootLetters: "ا ل ه" },
  { id: "70", lemmaAr: "رَحْمَٰن", rootLetters: "ر ح م" },
  // Same headword + root under two POS tags (noun and adjective), as in the corpus.
  { id: "1057", lemmaAr: "فَصْل", rootLetters: "ف ص ل", frequencyRank: 900 },
  { id: "5021", lemmaAr: "فَصْل", rootLetters: "ف ص ل", frequencyRank: 3000 },
  { id: "1329", lemmaAr: "فَصَلَ", rootLetters: "ف ص ل", frequencyRank: 950 },
];
const index = buildLemmaIndex(LEMMAS);

describe("bareLemmaKey", () => {
  it("folds Uthmani spelling to what a learner types", () => {
    expect(bareLemmaKey("كِتَٰب")).toBe("كتاب");
    expect(bareLemmaKey("عَلَىٰ")).toBe("على");
    expect(bareLemmaKey("ٱللَّه")).toBe("الله");
    expect(bareLemmaKey("رَحْمَٰن")).toBe("رحمان");
  });
});

describe("matchLemma", () => {
  it("links an unambiguous undiacritized word", () => {
    expect(matchLemma(index, "كتاب")?.id).toBe("47");
    expect(matchLemma(index, "على")?.id).toBe("12");
    expect(matchLemma(index, "الله")?.id).toBe("2");
  });

  it("accepts both standard spellings of a dagger-alif word", () => {
    expect(matchLemma(index, "رحمان")?.id).toBe("70");
    expect(matchLemma(index, "رحمن")?.id).toBe("70");
  });

  it("refuses to guess between homographs without diacritics", () => {
    // كتب = كَتَبَ (verb) or كُتُب (plural noun), same root — genuinely ambiguous.
    expect(matchLemma(index, "كتب")).toBeNull();
    expect(matchLemma(index, "كتب", "ك ت ب")).toBeNull();
  });

  it("uses the learner's diacritics to disambiguate", () => {
    expect(matchLemma(index, "كَتَبَ")?.id).toBe("231");
    expect(matchLemma(index, "كُتُب")?.id).toBe("900");
  });

  it("uses a supplied root to filter, and rejects a root that doesn't fit", () => {
    expect(matchLemma(index, "كتاب", "كتب")?.id).toBe("47");
    expect(matchLemma(index, "كتاب", "ق ر أ")).toBeNull();
  });

  it("treats one headword listed under two POS tags as one word, preferring the more frequent", () => {
    expect(matchLemma(index, "فَصْل")?.id).toBe("1057");
    // Undiacritized فصل also matches the verb فَصَلَ — a different word, so still ambiguous.
    expect(matchLemma(index, "فصل")).toBeNull();
  });

  it("returns null for words not in the dictionary", () => {
    expect(matchLemma(index, "حاسوب")).toBeNull();
  });
});
