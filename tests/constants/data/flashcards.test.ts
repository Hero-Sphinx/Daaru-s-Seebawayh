import { describe, expect, it } from "vitest";
import { FLASHCARD_BOOKS, findFlashcardBook, findFlashcardSection, TADHIM_AL_ILM } from "@/constants";
import type { Flashcard } from "@/types";

/**
 * The decks are hand-written content, so these tests are the safety net for
 * their shape: every card cites a page inside its chapter, every Arabic word is
 * vowelled, and each chapter that quotes poetry has its lines as cards. The
 * substance (wording, ḥarakāt, attributions) is checked by a person.
 */

const ARABIC_LETTER = /[ء-ي]/g;
/** Ḥarakāt, sukūn, shaddah — and the dagger alif of Uthmani āyāt (ٰ). */
const HARAKAH = /[ً-ْٰ]/;
/** A run of Arabic letters and marks — one word. */
const ARABIC_WORD = /[ء-ْٰ]+/g;

const arabicOf = (c: Flashcard) => [c.front.ar, c.back.ar, ...(c.note ? [c.note.ar] : [])];
const englishOf = (c: Flashcard) => [c.front.en, c.back.en, ...(c.note ? [c.note.en] : [])];

/**
 * Words of two or more letters with no ḥarakah at all. Āyāt (﴿…﴾) are skipped: they are copied from
 * the Qur'an table in the Uthmani script, whose marks (e.g. the hamza in أَسَٰٓـُٔوا۟) split words oddly.
 */
function unvowelledWords(text: string): string[] {
  return (text.replace(/﴿[^﴾]*﴾/g, " ").match(ARABIC_WORD) ?? []).filter((w) => (w.match(ARABIC_LETTER) ?? []).length >= 2 && !HARAKAH.test(w));
}

describe.each(FLASHCARD_BOOKS.map((b) => [b.slug, b] as const))("book %s", (_slug, book) => {
  it("numbers its chapters 1, 2, 3 … in order, with ascending page ranges", () => {
    book.sections.forEach((s, i) => {
      expect(s.number).toBe(i + 1);
      expect(s.pages[0]).toBeLessThanOrEqual(s.pages[1]);
      if (i > 0) expect(s.pages[0], s.label.en).toBeGreaterThan(book.sections[i - 1].pages[1]);
    });
  });

  it("vowels every Arabic word (titles, cards and notes)", () => {
    const texts = [book.title.ar, book.author.ar, ...book.sections.flatMap((s) => [s.label.ar, s.title.ar, ...s.cards.flatMap(arabicOf)])];
    const bare = texts.flatMap((t) => unvowelledWords(t).map((w) => `${w}  (in: ${t.slice(0, 50)}…)`));
    expect(bare, "add ḥarakāt to these words").toEqual([]);
  });

  it("names its chapters and subject, for the shelf and the book page", () => {
    expect(book.shortTitle.trim()).not.toBe("");
    expect(book.subject.trim()).not.toBe("");
    expect(book.chapters.en).toMatch(/^[a-z ]+$/);
    expect(unvowelledWords(book.chapters.ar)).toEqual([]);
  });

  it("does not repeat a question within the book", () => {
    const fronts = book.sections.flatMap((s) => s.cards.map((c) => c.front.en));
    expect(fronts.filter((f, i) => fronts.indexOf(f) !== i)).toEqual([]);
  });

  describe.each(book.sections.map((s) => [s.label.en, s] as const))("%s", (_label, section) => {
    it("has enough cards, opening with the chapter's own title", () => {
      // Short chapters of a matn (a single rule, a short bāb) have little to ask; longer books are held higher below.
      expect(section.cards.length).toBeGreaterThanOrEqual(5);
      expect(section.cards[0].kind).toBe("principle");
      expect(section.cards[0].back).toEqual(section.title);
    });

    it("cites a page inside the chapter on every card", () => {
      for (const c of section.cards) {
        expect(c.page, c.front.en).toBeGreaterThanOrEqual(section.pages[0]);
        expect(c.page, c.front.en).toBeLessThanOrEqual(section.pages[1]);
      }
    });

    it("writes each side in its own language", () => {
      for (const c of section.cards) {
        for (const ar of arabicOf(c)) expect(ar.match(ARABIC_LETTER)?.length ?? 0, c.front.en).toBeGreaterThan(0);
        // English may carry ﷺ / ﷻ (presentation forms), never Arabic letters.
        for (const en of englishOf(c)) expect(en.trim(), c.front.en).not.toMatch(/^$|[ء-ي]/);
      }
    });

    it("leaves a blank on both sides of every fill-in-the-blank card", () => {
      for (const c of section.cards.filter((x) => x.kind === "cloze")) {
        expect(c.front.en, c.front.en).toContain("______");
        expect(c.front.ar, c.front.en).toContain("______");
      }
    });
  });
});

describe("Taʿẓīm al-ʿIlm", () => {
  // Principles 2, 14, 16, 17 and 18 quote no poetry in this edition; every other one does.
  const WITHOUT_POETRY = [2, 14, 16, 17, 18];

  it("has the twenty principles, each with at least ten cards", () => {
    expect(TADHIM_AL_ILM.sections).toHaveLength(20);
    for (const s of TADHIM_AL_ILM.sections) expect(s.cards.length, s.label.en).toBeGreaterThanOrEqual(10);
  });

  it.each(TADHIM_AL_ILM.sections.filter((s) => !WITHOUT_POETRY.includes(s.number)).map((s) => [s.number, s] as const))(
    "principle %i has at least two lines of its poetry as cards",
    (_n, section) => {
      expect(section.cards.filter((c) => c.kind === "poetry").length).toBeGreaterThanOrEqual(2);
    },
  );
});

describe("finding a deck", () => {
  it("resolves books and chapter numbers from the URL", () => {
    const book = findFlashcardBook("tadhim-al-ilm");
    expect(book).toBe(TADHIM_AL_ILM);
    expect(findFlashcardSection(TADHIM_AL_ILM, "1")?.number).toBe(1);
    expect(findFlashcardSection(TADHIM_AL_ILM, "20")?.number).toBe(20);
    expect(findFlashcardBook("nope")).toBeUndefined();
  });

  it.each(["0", "21", "01", "1.5", "abc", "", "-1"])("rejects chapter %j", (n) => {
    expect(findFlashcardSection(TADHIM_AL_ILM, n)).toBeUndefined();
  });

  it("has unique, URL-safe book slugs", () => {
    const slugs = FLASHCARD_BOOKS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
});
