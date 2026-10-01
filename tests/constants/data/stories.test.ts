import { describe, expect, it } from "vitest";
import { findStory, STORIES } from "@/constants";
import { isArabicWord, paragraphWords, speechChunks, storyWordKey } from "@/helpers";
import { speechTextSchema } from "@/server/validators/speech/validate";

/**
 * The stories are hand-written content, so these tests are the safety net:
 * every word a reader can tap must have a meaning, and nothing is left over.
 */
describe.each(STORIES.map((s) => [s.slug, s] as const))("story %s", (_slug, story) => {
  const keys = Object.keys(story.glossary).map(storyWordKey);
  const words = story.paragraphs.flatMap(paragraphWords);
  const wordKeys = new Set(words.map(storyWordKey));

  it("has one glossary entry per spelling (vowels ignored)", () => {
    const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(duplicates, "merge these entries — they differ only in vowels").toEqual([]);
  });

  it("explains every word in the story", () => {
    const missing = [...new Set(words.filter((w) => !keys.includes(storyWordKey(w))))];
    expect(missing, "add these words to the glossary").toEqual([]);
  });

  it("has no glossary entries for words that aren't in the story", () => {
    const unused = Object.keys(story.glossary).filter((k) => !wordKeys.has(storyWordKey(k)));
    expect(unused, "remove these entries or fix their spelling").toEqual([]);
  });

  it("gives well-formed roots, lemmas and hints", () => {
    for (const [word, gloss] of Object.entries(story.glossary)) {
      expect(gloss.meaning.trim(), word).not.toBe("");
      if (gloss.root) expect(gloss.root, word).toMatch(/^[ء-ي]( [ء-ي]){2,3}$/);
      if (gloss.lemma) expect(isArabicWord(gloss.lemma), word).toBe(true);
    }
  });

  it("has answerable questions", () => {
    expect(story.questions.length).toBeGreaterThan(0);
    for (const q of story.questions) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.choices.length);
    }
  });

  it("can be read aloud in pieces the pronunciation service accepts", () => {
    for (const p of story.paragraphs) {
      for (const chunk of speechChunks(p)) expect(speechTextSchema.safeParse(chunk).success, chunk).toBe(true);
    }
  });
});

describe("story catalogue", () => {
  it("has unique, URL-safe slugs that findStory resolves", () => {
    const slugs = STORIES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(findStory(slug)?.slug).toBe(slug);
    }
    expect(findStory("nope")).toBeUndefined();
  });

  it("covers every level", () => {
    expect(new Set(STORIES.map((s) => s.level))).toEqual(new Set([1, 2, 3]));
  });
});
