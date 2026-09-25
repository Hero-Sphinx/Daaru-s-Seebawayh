import { describe, expect, it } from "vitest";
import { buildFawaidQuestions, buildIrabExcerptQuestions, type FawaidPoolItem, mulberry32, selectSentencesForMeaningMatch, splitIntoSentences } from "@/helpers";
import type { RawCandidate } from "@/helpers";
import camelFixtures from "../../fixtures/irab/camelCandidates.json";

describe("buildFawaidQuestions", () => {
  it("returns nothing when fewer than 2 fawaid have a body", () => {
    const items: FawaidPoolItem[] = [{ id: 1, title: "x", bodyEn: "only one", pageNumber: 1 }];
    expect(buildFawaidQuestions(items, mulberry32(1))).toEqual([]);
  });

  it("builds one MCQ per fawaid with a distinct correct body among the options", () => {
    const items: FawaidPoolItem[] = [
      { id: 1, title: "العلم نور", bodyEn: "An implicit simile comparing knowledge to light.", pageNumber: 1 },
      { id: 2, title: "دَرْس", bodyEn: "A rare word meaning lesson.", pageNumber: 1 },
      { id: 3, title: "مدرسة", bodyEn: "A word meaning school.", pageNumber: 2 },
    ];
    const questions = buildFawaidQuestions(items, mulberry32(42));
    expect(questions).toHaveLength(3);
    for (const q of questions) {
      expect(q.options).toContain(q.options[q.correctIndex]);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.subtype).toBe("fawaid_recall");
    }
  });

  it("skips fawaid rows with no bodyEn", () => {
    const items: FawaidPoolItem[] = [
      { id: 1, title: "a", bodyEn: "body a", pageNumber: 1 },
      { id: 2, title: "b", bodyEn: null, pageNumber: 1 },
      { id: 3, title: "c", bodyEn: "body c", pageNumber: 1 },
    ];
    const questions = buildFawaidQuestions(items, mulberry32(1));
    expect(questions).toHaveLength(2);
  });
});

describe("splitIntoSentences", () => {
  it("splits on newlines", () => {
    expect(splitIntoSentences("كَتَبَ الطَّالِبُ الدَّرْسَ\nالْعِلْمُ نُورٌ")).toEqual(["كَتَبَ الطَّالِبُ الدَّرْسَ", "الْعِلْمُ نُورٌ"]);
  });

  it("splits on sentence-final punctuation and drops empties", () => {
    expect(splitIntoSentences("جُمْلَةٌ أُولَى. جُمْلَةٌ ثَانِيَة؟  ")).toEqual(["جُمْلَةٌ أُولَى", "جُمْلَةٌ ثَانِيَة"]);
  });
});

describe("selectSentencesForMeaningMatch", () => {
  it("picks reasonably-sized Arabic sentences with their page numbers", () => {
    const selected = selectSentencesForMeaningMatch([
      { pageNumber: 1, text: "كَتَبَ الطَّالِبُ الدَّرْسَ فِي الصَّبَاحِ الْبَاكِرِ" },
      { pageNumber: 2, text: "الْعِلْمُ نُورٌ" },
    ]);
    expect(selected).toEqual([
      { text: "كَتَبَ الطَّالِبُ الدَّرْسَ فِي الصَّبَاحِ الْبَاكِرِ", pageNumber: 1 },
      { text: "الْعِلْمُ نُورٌ", pageNumber: 2 },
    ]);
  });

  it("filters out English-only pages, same as the I'rab excerpt selector", () => {
    const selected = selectSentencesForMeaningMatch([
      { pageNumber: 1, text: "Table of Contents\nChapter 1: Introduction" },
      { pageNumber: 2, text: "كَتَبَ الطَّالِبُ الدَّرْسَ" },
    ]);
    expect(selected).toEqual([{ text: "كَتَبَ الطَّالِبُ الدَّرْسَ", pageNumber: 2 }]);
  });

  it("respects the maxUnits/maxSentencesPerUnit caps", () => {
    const manyUnits = Array.from({ length: 10 }, (_, i) => ({ pageNumber: i + 1, text: "كَتَبَ الطَّالِبُ الدَّرْسَ. قَرَأَ الْوَلَدُ الْكِتَابَ." }));
    const selected = selectSentencesForMeaningMatch(manyUnits, 2, 1);
    expect(selected).toHaveLength(2);
  });
});

describe("buildIrabExcerptQuestions", () => {
  it("produces questions for a fully-resolvable diacritized sentence", async () => {
    // Real CAMeL analyses (tests/fixtures/irab, recorded by npm run irab:record-fixtures).
    const candidates = camelFixtures as Record<string, RawCandidate[]>;
    const fetchCandidates = async (w: string) => candidates[w] ?? [];

    const questions = await buildIrabExcerptQuestions(
      [{ pageNumber: 1, text: "كَتَبَ الطَّالِبُ الدَّرْسَ" }],
      fetchCandidates,
      mulberry32(1)
    );

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((q) => q.subtype === "irab_excerpt")).toBe(true);
    expect(questions.every((q) => q.pageNumber === 1)).toBe(true);
  });

  it("produces nothing for undiacritized text (the parser correctly refuses to guess)", async () => {
    const fetchCandidates = async () => [] as RawCandidate[];
    const questions = await buildIrabExcerptQuestions([{ pageNumber: 1, text: "كتب الطالب الدرس" }], fetchCandidates, mulberry32(1));
    expect(questions).toEqual([]);
  });

  it("respects the maxUnits/maxSentencesPerUnit caps", async () => {
    const fetchCandidates = async () => [] as RawCandidate[];
    const manyUnits = Array.from({ length: 10 }, (_, i) => ({ pageNumber: i + 1, text: "كَتَبَ الطَّالِبُ" }));
    // With empty candidates every sentence is unresolved, so this just checks it doesn't throw or hang across many units.
    const questions = await buildIrabExcerptQuestions(manyUnits, fetchCandidates, mulberry32(1), 2, 1);
    expect(questions).toEqual([]);
  });

  it("never calls fetchCandidates for English pages or English words in a mixed-language book", async () => {
    let calls = 0;
    // Real CAMeL analyses (tests/fixtures/irab, recorded by npm run irab:record-fixtures).
    const candidates = camelFixtures as Record<string, RawCandidate[]>;
    const fetchCandidates = async (w: string) => {
      calls++;
      return candidates[w] ?? [];
    };

    const questions = await buildIrabExcerptQuestions(
      [
        { pageNumber: 1, text: "Table of Contents\nChapter 1: Introduction to Arabic Grammar\nBy the Author" },
        { pageNumber: 2, text: "كَتَبَ الطَّالِبُ الدَّرْسَ\nhomework assignment notes" },
      ],
      fetchCandidates,
      mulberry32(1)
    );

    // Page 1 is entirely English -> filtered out before any call. Page 2's
    // first line is pure Arabic (3 words -> 3 calls, produces a question);
    // its second line is entirely English -> filtered out, 0 calls.
    expect(calls).toBe(3);
    expect(questions.length).toBeGreaterThan(0);
  });
});
