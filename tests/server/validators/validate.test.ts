import { describe, expect, it } from "vitest";

import { searchQuerySchema, shareBodySchema } from "@/server/validators/library/validate";
import { attemptBodySchema, sessionBodySchema } from "@/server/validators/quiz/validate";
import { reviewBodySchema } from "@/server/validators/srs/validate";
import { createVocabularyBodySchema, MAX_VOCABULARY_IMPORT } from "@/server/validators/vocabulary/validate";

describe("quiz attempts", () => {
  it("accepts every book-quiz subtype as a topic, including sentence meaning", () => {
    for (const topic of ["fawaid_recall", "irab_reconstruction", "book_comprehension", "sentence_meaning_match"]) {
      expect(attemptBodySchema.safeParse({ topic, isCorrect: true, userAnswer: "x" }).success).toBe(true);
    }
  });

  it("needs a template code or a topic", () => {
    expect(attemptBodySchema.safeParse({ isCorrect: false, userAnswer: "x" }).success).toBe(false);
  });

  it("rounds response times to whole milliseconds", () => {
    expect(attemptBodySchema.parse({ topic: "vocab", isCorrect: true, responseTimeMs: 1234.6 }).responseTimeMs).toBe(1235);
  });
});

describe("quiz sessions", () => {
  it("fills defaults for an empty body", () => {
    expect(sessionBodySchema.parse({})).toEqual({ topic: "mixed", count: 10, difficulty: "beginner" });
  });

  it("clamps the question count and ignores an unknown difficulty", () => {
    expect(sessionBodySchema.parse({ count: 500, difficulty: "impossible" })).toMatchObject({ count: 30, difficulty: "beginner" });
  });

  it("rejects an unknown topic", () => {
    expect(sessionBodySchema.safeParse({ topic: "poetry" }).success).toBe(false);
  });
});

describe("vocabulary", () => {
  it("trims words and drops empty optional fields", () => {
    const { items } = createVocabularyBodySchema.parse({ items: [{ wordAr: " كتاب ", meaningEn: " book ", root: "" }] });
    expect(items[0]).toEqual({ wordAr: "كتاب", meaningEn: "book", root: undefined, transliteration: undefined, exampleAr: undefined });
  });

  it("requires the word and its meaning", () => {
    expect(createVocabularyBodySchema.safeParse({ items: [{ wordAr: "كتاب", meaningEn: "  " }] }).success).toBe(false);
  });

  it("caps a single import", () => {
    const items = Array.from({ length: MAX_VOCABULARY_IMPORT + 1 }, () => ({ wordAr: "كتاب", meaningEn: "book" }));
    expect(createVocabularyBodySchema.safeParse({ items }).success).toBe(false);
  });
});

describe("srs reviews", () => {
  it("only takes whole-number grades from 0 to 5", () => {
    expect(reviewBodySchema.safeParse({ cardId: 1, quality: 4 }).success).toBe(true);
    expect(reviewBodySchema.safeParse({ cardId: 1, quality: 6 }).success).toBe(false);
    expect(reviewBodySchema.safeParse({ cardId: 1, quality: 2.5 }).success).toBe(false);
  });
});

describe("library", () => {
  it("normalises share emails", () => {
    expect(shareBodySchema.parse({ email: "  Aminah@Example.com ", role: "viewer" }).email).toBe("aminah@example.com");
  });

  it("defaults the search mode to text", () => {
    expect(searchQuerySchema.parse({ q: "كتب", mode: "sideways" }).mode).toBe("text");
  });
});
