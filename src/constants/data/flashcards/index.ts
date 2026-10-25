import type { FlashcardBook, FlashcardSection } from "@/types";
import { AJURRUMIYYAH } from "./ajurrumiyyah";
import { AQIDAH_WASITIYYAH } from "./aqidahWasitiyyah";
import { QAWAID_ARBAA } from "./qawaidArbaa";
import { TADHIM_AL_ILM } from "./tadhimAlIlm";
import { THALATHAT_AL_USUL } from "./thalathatAlUsul";

export { AJURRUMIYYAH, AQIDAH_WASITIYYAH, QAWAID_ARBAA, TADHIM_AL_ILM, THALATHAT_AL_USUL };

/**
 * Hand-written flashcard decks for books students study, one deck per chapter.
 * To add a book, write its file next to tadhimAlIlm.ts, list it here, and run
 * the tests (tests/constants/data/flashcards.test.ts).
 */
export const FLASHCARD_BOOKS: FlashcardBook[] = [TADHIM_AL_ILM, THALATHAT_AL_USUL, QAWAID_ARBAA, AQIDAH_WASITIYYAH, AJURRUMIYYAH];

export function findFlashcardBook(slug: string): FlashcardBook | undefined {
  return FLASHCARD_BOOKS.find((b) => b.slug === slug);
}

/** A chapter by its number as it appears in the URL ("1", "12"); anything else is not found. */
export function findFlashcardSection(book: FlashcardBook, number: string): FlashcardSection | undefined {
  if (!/^[1-9]\d*$/.test(number)) return undefined;
  return book.sections.find((s) => s.number === Number(number));
}
