import { describe, expect, it } from "vitest";
import { buildRootFormIndex, findRootMatches, parseRootInput, peelPrefixes, spellingVariants, wordMatchesRoot } from "@/server/services/library/rootSearch";

// Real Uthmani surfaces of ك ت ب words / stems from the imported corpus.
const index = buildRootFormIndex(
  ["ٱلْكِتَٰبُ", "كَتَبَ", "يَكْتُبُونَ", "وَكُتُبِهِۦ", "كَٰتِبٌ"],
  ["كِتَٰبُ", "كَتَبَ", "كْتُبُونَ", "كُتُبِ", "كَٰتِبٌ"]
);

describe("spellingVariants", () => {
  it("yields both standard spellings of a dagger-alif word", () => {
    expect(spellingVariants("ٱلْكِتَٰبُ").sort()).toEqual(["الكتاب", "الكتب"].sort());
    expect(spellingVariants("عَلَىٰ")).toEqual(["على"]);
  });
});

describe("peelPrefixes", () => {
  it("peels conjunction, preposition and article layers", () => {
    expect(peelPrefixes("وبالكتاب")).toEqual(expect.arrayContaining(["بالكتاب", "الكتاب", "كتاب"]));
    expect(peelPrefixes("للكتاب")).toContain("كتاب");
  });

  it("never peels a word down to nothing", () => {
    expect(peelPrefixes("ول")).toEqual(["ول"]);
  });
});

describe("wordMatchesRoot", () => {
  it("matches attested forms in modern spelling, with or without clitics", () => {
    for (const w of ["الكتاب", "كتاب", "وبالكتاب", "للكتاب", "كتب", "يكتبون", "كاتب", "فكتب"]) {
      expect(wordMatchesRoot(w, index), w).toBe(true);
    }
  });

  it("peels one attached suffix (agreement or pronoun)", () => {
    for (const w of ["كتابهم", "وكتابه", "كتبوا", "كتبت"]) expect(wordMatchesRoot(w, index), w).toBe(true);
  });

  it("does not match unrelated words or unattested derivations", () => {
    for (const w of ["كتم", "مكتبة", "بكت", "الكرم"]) expect(wordMatchesRoot(w, index), w).toBe(false);
  });
});

describe("findRootMatches", () => {
  it("finds every form in diacritized running text", () => {
    const { matches } = findRootMatches("قَرَأَ الطَّالِبُ الْكِتَابَ ثُمَّ كَتَبَ دَرْسَهُ فِي مَكْتَبَةٍ", index);
    expect(matches.map((m) => m.word)).toEqual(["الكتاب", "كتب"]);
  });
});

describe("parseRootInput", () => {
  it("recognizes spaced/dotted roots and rejects words", () => {
    expect(parseRootInput("ك ت ب")).toBe("ك ت ب");
    expect(parseRootInput("ك.ت.ب")).toBe("ك ت ب");
    expect(parseRootInput("د ح ر ج")).toBe("د ح ر ج");
    expect(parseRootInput("كتب")).toBeNull();
    expect(parseRootInput("ك ت")).toBeNull();
  });
});
