import "server-only";
import { findFlashcardBook } from "@/constants";
import { badRequest, notFound } from "@/server/constants";
import { db } from "@/server/databases";

/**
 * Which decks of class-released books are unlocked (table flashcard_releases).
 * The cards themselves live in code (src/constants/data/flashcards/); this is
 * only the switch an admin flips after each lesson.
 */

/** Unlocked chapter numbers of one book, ascending. */
export async function getReleasedSections(bookSlug: string): Promise<number[]> {
  const rows = await db.flashcard_releases.findMany({ where: { book_slug: bookSlug }, select: { section_number: true }, orderBy: { section_number: "asc" } });
  return rows.map((r) => r.section_number);
}

/** Unlocked chapter numbers of every book, keyed by slug (books with none unlocked are absent). */
export async function getAllReleasedSections(): Promise<Record<string, number[]>> {
  const rows = await db.flashcard_releases.findMany({ select: { book_slug: true, section_number: true }, orderBy: { section_number: "asc" } });
  const bySlug: Record<string, number[]> = {};
  for (const r of rows) (bySlug[r.book_slug] ??= []).push(r.section_number);
  return bySlug;
}

/** Unlocks or locks one deck. Idempotent: unlocking an open deck (or locking a locked one) changes nothing. The caller checks the admin. */
export async function setSectionRelease(userId: string, bookSlug: string, section: number, released: boolean): Promise<void> {
  const book = findFlashcardBook(bookSlug);
  if (!book) throw notFound("No such book");
  if (!book.releasedWithClass) throw badRequest("This book's decks are always open — there is nothing to unlock.");
  if (!book.sections.some((s) => s.number === section)) throw notFound("No such chapter in this book");

  const key = { book_slug_section_number: { book_slug: bookSlug, section_number: section } };
  if (released) {
    await db.flashcard_releases.upsert({ where: key, create: { book_slug: bookSlug, section_number: section, released_by: userId }, update: {} });
  } else {
    await db.flashcard_releases.deleteMany({ where: { book_slug: bookSlug, section_number: section } });
  }
}
