import { describe, expect, it } from "vitest";
import { generateQuizQuestions, mulberry32, type VocabPoolItem } from "./generate";

const TEST_VOCAB: VocabPoolItem[] = [
  { id: 1, wordAr: "كِتَاب", transliteration: "kitab", meaningEn: "book", root: "ك ت ب" },
  { id: 2, wordAr: "عِلْم", transliteration: "ilm", meaningEn: "knowledge", root: "ع ل م" },
  { id: 3, wordAr: "دَرْس", transliteration: "dars", meaningEn: "lesson", root: "د ر س" },
  { id: 4, wordAr: "حِكْمَة", transliteration: "hikmah", meaningEn: "wisdom", root: "ح ك م" },
];

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("produces values in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("generateQuizQuestions", () => {
  for (const topic of ["vocab", "irab", "sarf", "meaning"] as const) {
    it(`generates well-formed, non-duplicate "${topic}" questions`, () => {
      const questions = generateQuizQuestions(topic, 5, TEST_VOCAB, mulberry32(1));
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(5);

      const ids = new Set(questions.map((q) => q.id));
      expect(ids.size).toBe(questions.length);

      for (const q of questions) {
        expect(q.topic).toBe(topic);
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.options.length).toBeLessThanOrEqual(4);
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    });
  }

  it("never repeats a question id within a single mixed session", () => {
    const questions = generateQuizQuestions("mixed", 15, TEST_VOCAB, mulberry32(99));
    const ids = new Set(questions.map((q) => q.id));
    expect(ids.size).toBe(questions.length);
  });

  it("returns fewer questions than requested rather than repeating, when the bank is smaller", () => {
    const questions = generateQuizQuestions("sarf", 100, TEST_VOCAB, mulberry32(3));
    const ids = new Set(questions.map((q) => q.id));
    expect(ids.size).toBe(questions.length);
    expect(questions.length).toBeLessThan(100);
  });

  it("is deterministic for a given seed", () => {
    const a = generateQuizQuestions("mixed", 10, TEST_VOCAB, mulberry32(2026));
    const b = generateQuizQuestions("mixed", 10, TEST_VOCAB, mulberry32(2026));
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(a.map((q) => q.correctIndex)).toEqual(b.map((q) => q.correctIndex));
  });

  it("returns no vocab questions when the vocabulary bank has fewer than 2 words", () => {
    expect(generateQuizQuestions("vocab", 5, [], mulberry32(1))).toEqual([]);
    expect(generateQuizQuestions("vocab", 5, [TEST_VOCAB[0]], mulberry32(1))).toEqual([]);
  });

  it("builds meaning-matching questions from curated sentences' verified translations", () => {
    const questions = generateQuizQuestions("meaning", 5, TEST_VOCAB, mulberry32(1));
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.topic).toBe("meaning");
      // The prompt sentence (Arabic) and the options (English translations) must never mix scripts.
      expect(q.promptAr).toMatch(/[؀-ۿ]/);
      for (const option of q.options) expect(option).not.toMatch(/[؀-ۿ]/);
    }
  });
});
