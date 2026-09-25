import { describe, expect, it } from "vitest";
import { tokenizeSentence } from "@/helpers/irab/tokenize";

describe("tokenizeSentence", () => {
  it("splits on whitespace", () => {
    expect(tokenizeSentence("كَتَبَ الطَّالِبُ الدَّرْسَ")).toEqual(["كَتَبَ", "الطَّالِبُ", "الدَّرْسَ"]);
  });

  it("strips trailing punctuation", () => {
    expect(tokenizeSentence("الْعِلْمُ نُورٌ.")).toEqual(["الْعِلْمُ", "نُورٌ"]);
    expect(tokenizeSentence("هَلْ ذَهَبَ؟")).toEqual(["هَلْ", "ذَهَبَ"]);
  });

  it("collapses multiple spaces and trims", () => {
    expect(tokenizeSentence("  كَتَبَ   الطَّالِبُ  ")).toEqual(["كَتَبَ", "الطَّالِبُ"]);
  });

  it("returns an empty array for empty input", () => {
    expect(tokenizeSentence("")).toEqual([]);
    expect(tokenizeSentence("   ")).toEqual([]);
  });
});
