import { describe, expect, it } from "vitest";
import { isArabicWord, isMostlyArabic } from "./arabic-script";

describe("isArabicWord", () => {
  it("recognizes Arabic words, diacritized or not", () => {
    expect(isArabicWord("كتاب")).toBe(true);
    expect(isArabicWord("كِتَابٌ")).toBe(true);
  });

  it("rejects English/Latin words", () => {
    expect(isArabicWord("book")).toBe(false);
    expect(isArabicWord("Al-Ajurrumiyyah")).toBe(false);
  });

  it("rejects pure numbers/punctuation", () => {
    expect(isArabicWord("123")).toBe(false);
    expect(isArabicWord("...")).toBe(false);
  });
});

describe("isMostlyArabic", () => {
  it("is true for an Arabic sentence", () => {
    expect(isMostlyArabic("كَتَبَ الطَّالِبُ الدَّرْسَ")).toBe(true);
  });

  it("is false for an English sentence", () => {
    expect(isMostlyArabic("The student wrote the lesson")).toBe(false);
  });

  it("is true for a mostly-Arabic line with one embedded English word", () => {
    expect(isMostlyArabic("كَتَبَ الطَّالِبُ homework الدَّرْسَ")).toBe(true);
  });

  it("is false for empty or whitespace-only text", () => {
    expect(isMostlyArabic("")).toBe(false);
    expect(isMostlyArabic("   ")).toBe(false);
  });
});
