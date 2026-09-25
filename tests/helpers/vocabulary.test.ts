import { describe, expect, it } from "vitest";
import { parseBulkVocabularyText } from "@/helpers";

describe("parseBulkVocabularyText", () => {
  it("parses word,meaning pairs", () => {
    const rows = parseBulkVocabularyText("كِتَاب,book\nعِلْم,knowledge");
    expect(rows).toEqual([
      { wordAr: "كِتَاب", meaningEn: "book", root: undefined, transliteration: undefined, exampleAr: undefined },
      { wordAr: "عِلْم", meaningEn: "knowledge", root: undefined, transliteration: undefined, exampleAr: undefined },
    ]);
  });

  it("parses optional root/transliteration/example columns", () => {
    const rows = parseBulkVocabularyText("كِتَاب,book,ك ت ب,kitab,قَرَأْتُ الكِتَابَ");
    expect(rows).toEqual([
      { wordAr: "كِتَاب", meaningEn: "book", root: "ك ت ب", transliteration: "kitab", exampleAr: "قَرَأْتُ الكِتَابَ" },
    ]);
  });

  it("skips blank lines and a header row", () => {
    const rows = parseBulkVocabularyText("arabic,meaning\n\nكِتَاب,book\n   \n");
    expect(rows).toEqual([{ wordAr: "كِتَاب", meaningEn: "book", root: undefined, transliteration: undefined, exampleAr: undefined }]);
  });

  it("drops rows missing the word or the meaning", () => {
    const rows = parseBulkVocabularyText("كِتَاب,\n,book\nكِتَاب,book");
    expect(rows).toHaveLength(1);
    expect(rows[0].wordAr).toBe("كِتَاب");
  });

  it("trims whitespace around columns", () => {
    const rows = parseBulkVocabularyText("  كِتَاب  ,  book  ");
    expect(rows).toEqual([{ wordAr: "كِتَاب", meaningEn: "book", root: undefined, transliteration: undefined, exampleAr: undefined }]);
  });
});
