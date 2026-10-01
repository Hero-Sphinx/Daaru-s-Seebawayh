import { describe, expect, it } from "vitest";
import { paragraphWords, sentenceAround, speechChunks, storyWordKey, tokenizeParagraph } from "@/helpers";

describe("storyWordKey", () => {
  it("ignores vowels and folds hamza forms on alif", () => {
    expect(storyWordKey("كُلَّ")).toBe(storyWordKey("كُلُّ"));
    expect(storyWordKey("أَبْيَضُ")).toBe("ابيض");
    expect(storyWordKey("الآنَ")).toBe("الان");
  });
});

describe("tokenizeParagraph", () => {
  it("splits words from punctuation and spaces, losing nothing", () => {
    const p = "قَالَ يُوسُفُ: «أَنَا آسِفٌ.»";
    const tokens = tokenizeParagraph(p);
    expect(tokens.map((t) => t.text).join("")).toBe(p);
    expect(tokens.filter((t) => t.kind === "word").map((t) => t.text)).toEqual(["قَالَ", "يُوسُفُ", "أَنَا", "آسِفٌ"]);
  });

  it("keeps the Arabic comma and question mark out of words", () => {
    expect(paragraphWords("هَلْ نَزُورُهُ، يَا أَبِي؟")).toEqual(["هَلْ", "نَزُورُهُ", "يَا", "أَبِي"]);
  });
});

describe("sentenceAround", () => {
  const p = "هَذِهِ قِطَّةٌ. اسْمُهَا لُؤْلُؤَةُ! هَلْ تَرَاهَا؟";
  it("finds the sentence holding the nth word", () => {
    expect(sentenceAround(p, 0)).toBe("هَذِهِ قِطَّةٌ.");
    expect(sentenceAround(p, 2)).toBe("اسْمُهَا لُؤْلُؤَةُ!");
    expect(sentenceAround(p, 4)).toBe("هَلْ تَرَاهَا؟");
  });
});

describe("speechChunks", () => {
  it("cuts between words, under the limit, without punctuation", () => {
    const chunks = speechChunks("وَاحِدٌ، اثْنَانِ. ثَلَاثَةٌ أَرْبَعَةٌ!", 20);
    expect(chunks).toEqual(["وَاحِدٌ اثْنَانِ", "ثَلَاثَةٌ أَرْبَعَةٌ"]);
    expect(chunks.every((c) => c.length <= 20)).toBe(true);
  });

  it("keeps a short paragraph whole", () => {
    expect(speechChunks("هِيَ مُتْعَبَةٌ.")).toEqual(["هِيَ مُتْعَبَةٌ"]);
  });
});
