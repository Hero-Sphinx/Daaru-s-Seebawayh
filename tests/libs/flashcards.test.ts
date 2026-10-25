import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FEEDBACK_EMAIL, FLASHCARD_BOOKS, TADHIM_AL_ILM } from "@/constants";
import { FlashcardBookWrapper, FlashcardDeckWrapper, FlashcardsWrapper } from "@/libs";
import { type FlashcardBookSummary, FlashcardShelf, SHELF_FILTER_FROM } from "@/libs/FlashcardsWrapper/components";

/** Smoke tests: the flashcard pages render on the server. */
describe("flashcard shelf", () => {
  it("lists each book once, linking to that book's own page — not straight to its decks", () => {
    const html = renderToStaticMarkup(createElement(FlashcardsWrapper, { released: {} }));
    for (const book of FLASHCARD_BOOKS) {
      expect(html).toContain(`href="/library/flashcards/${book.slug}"`);
      expect(html).toContain(`${book.shortTitle} flashcards`);
      expect(html).not.toContain(`/library/flashcards/${book.slug}/1"`);
    }
  });

  const summary = (i: number): FlashcardBookSummary => ({
    slug: `book-${i}`,
    titleEn: `Book ${i}`,
    titleAr: "كِتَابٌ",
    shortTitle: `Book ${i}`,
    authorEn: "An author",
    subject: i % 2 ? "Fiqh" : "Naḥw",
    blurb: "",
    chaptersEn: "chapters",
    deckCount: 3,
    openCount: 3,
    releasedWithClass: false,
    cardCount: 30,
  });

  it("invites requests for more books, with the feedback email", () => {
    const html = renderToStaticMarkup(createElement(FlashcardsWrapper, { released: {} }));
    expect(html).toContain("More books coming soon");
    expect(html).toContain(`mailto:${FEEDBACK_EMAIL}`);
  });

  it("shows no search or filters for a short shelf", () => {
    const html = renderToStaticMarkup(createElement(FlashcardShelf, { books: [summary(1)] }));
    expect(html).not.toContain('type="search"');
  });

  it("adds search and subject filters once the shelf is long", () => {
    const books = Array.from({ length: SHELF_FILTER_FROM }, (_, i) => summary(i));
    const html = renderToStaticMarkup(createElement(FlashcardShelf, { books }));
    expect(html).toContain('type="search"');
    expect(html).toContain("All subjects");
    expect(html).toContain("Fiqh");
    expect(html).toContain("Naḥw");
  });

  it("says how many decks of a class book are open", () => {
    const html = renderToStaticMarkup(createElement(FlashcardsWrapper, { released: { [TADHIM_AL_ILM.slug]: [1, 2, 3] } }));
    expect(html).toContain("3 of 20 principles open");
  });
});

describe("a book's page", () => {
  const allOpen = (b: (typeof FLASHCARD_BOOKS)[number]) => b.sections.map((s) => s.number);
  const deckLinks = (html: string, slug: string) => [...html.matchAll(new RegExp(`/library/flashcards/${slug}/(\\d+)"`, "g"))].map((m) => Number(m[1]));

  it.each(FLASHCARD_BOOKS.map((b) => [b.slug, b] as const))("%s links every one of its decks, and only its own", (_slug, book) => {
    const html = renderToStaticMarkup(createElement(FlashcardBookWrapper, { book, released: allOpen(book), isAdmin: false }));
    for (const s of book.sections) expect(html).toContain(`/library/flashcards/${book.slug}/${s.number}`);
    for (const other of FLASHCARD_BOOKS.filter((b) => b.slug !== book.slug)) expect(html).not.toContain(`/library/flashcards/${other.slug}/`);
    expect(html).toContain(book.source.url);
    expect(html).toContain('href="/library/flashcards"');
  });

  it("says whose English it is — the edition's, or our own translation", () => {
    const render = (book: (typeof FLASHCARD_BOOKS)[number]) =>
      renderToStaticMarkup(createElement(FlashcardBookWrapper, { book, released: allOpen(book), isAdmin: false }));
    expect(render(TADHIM_AL_ILM)).toContain("quoted from the bilingual edition");
    const ours = FLASHCARD_BOOKS.filter((b) => b.source.english === "ours");
    expect(ours.length).toBeGreaterThan(0);
    for (const book of ours) {
      const html = render(book);
      expect(html).toContain("our own translation");
      expect(html).not.toContain("bilingual edition");
    }
  });

  it("opens every deck of a book that is not taught in a class", () => {
    for (const book of FLASHCARD_BOOKS.filter((b) => !b.releasedWithClass)) {
      const html = renderToStaticMarkup(createElement(FlashcardBookWrapper, { book, released: [], isAdmin: false }));
      expect(deckLinks(html, book.slug)).toEqual(book.sections.map((s) => s.number));
    }
  });

  it("links a student only to the decks taught so far, and shows the rest as locked", () => {
    const html = renderToStaticMarkup(createElement(FlashcardBookWrapper, { book: TADHIM_AL_ILM, released: [1, 2, 9], isAdmin: false }));
    expect(deckLinks(html, TADHIM_AL_ILM.slug)).toEqual([1, 2, 9]);
    expect(html).toContain("Opens after it&#x27;s taught in class");
    expect(html).not.toContain('href="/admin"');
  });

  it("lets an admin preview locked decks, marked as hidden from students", () => {
    const html = renderToStaticMarkup(createElement(FlashcardBookWrapper, { book: TADHIM_AL_ILM, released: [1], isAdmin: true }));
    expect(deckLinks(html, TADHIM_AL_ILM.slug)).toHaveLength(20);
    expect(html).toContain("students can&#x27;t see it yet");
    expect(html).toContain('href="/admin"');
  });
});

const deckBook = { slug: TADHIM_AL_ILM.slug, shortTitle: TADHIM_AL_ILM.shortTitle, chapters: TADHIM_AL_ILM.chapters, source: TADHIM_AL_ILM.source };

describe("a deck", () => {
  it.each(TADHIM_AL_ILM.sections.map((s) => [s.number, s] as const))("opens principle %i on its first card, answer hidden", (_n, section) => {
    const html = renderToStaticMarkup(createElement(FlashcardDeckWrapper, { book: deckBook, section }));
    const first = section.cards[0];
    expect(html).toContain(first.front.ar);
    expect(html).toContain(first.front.en);
    expect(html).not.toContain("عَرَفْتُهُ"); // the "Got it" button only shows with the answer
    expect(html).toContain("Show answer");
    expect(html).toContain(`0 of ${section.cards.length} learnt`);
    expect(html).toContain(`href="/library/flashcards/${TADHIM_AL_ILM.slug}"`); // back to this book, not the shelf
  });

  it("shows a locked deck as a notice, with no cards", () => {
    const section = TADHIM_AL_ILM.sections[9];
    const html = renderToStaticMarkup(createElement(FlashcardDeckWrapper, { book: deckBook, section: { ...section, cards: [] }, access: "locked" }));
    expect(html).toContain("This deck opens after it&#x27;s taught in class");
    expect(html).not.toContain("Show answer");
    expect(html).not.toContain(section.cards[1].front.en);
  });

  it("marks an admin's preview of a locked deck", () => {
    const html = renderToStaticMarkup(createElement(FlashcardDeckWrapper, { book: deckBook, section: TADHIM_AL_ILM.sections[9], access: "preview" }));
    expect(html).toContain("Admin preview");
    expect(html).toContain("Show answer");
  });
});
