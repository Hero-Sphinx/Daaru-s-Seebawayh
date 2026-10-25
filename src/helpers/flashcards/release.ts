import type { FlashcardBook } from "@/types";

/**
 * Whether students can open a deck: always, unless the book is released with
 * the class — then only once an admin has unlocked it (`released` holds the
 * unlocked chapter numbers, from the flashcard_releases table).
 */
export function isDeckOpen(book: Pick<FlashcardBook, "releasedWithClass">, section: number, released: readonly number[]): boolean {
  return !book.releasedWithClass || released.includes(section);
}

/** How many of a book's decks students can open. */
export function openDeckCount(book: Pick<FlashcardBook, "releasedWithClass" | "sections">, released: readonly number[]): number {
  return book.sections.filter((s) => isDeckOpen(book, s.number, released)).length;
}
