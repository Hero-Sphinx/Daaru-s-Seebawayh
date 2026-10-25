import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findFlashcardBook, findFlashcardSection } from "@/constants";
import { isDeckOpen } from "@/helpers";
import { FlashcardDeckWrapper } from "@/libs";
import { currentUserIsAdmin, getCurrentUserId } from "@/server/lib";
import { getReleasedSections } from "@/server/services";

export const dynamic = "force-dynamic";

async function findDeck(params: PageProps<"/library/flashcards/[book]/[chapter]">["params"]) {
  const { book: slug, chapter } = await params;
  const book = findFlashcardBook(slug);
  const section = book && findFlashcardSection(book, chapter);
  return book && section ? { book, section } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/library/flashcards/[book]/[chapter]">): Promise<Metadata> {
  const deck = await findDeck(params);
  return { title: deck ? `${deck.book.shortTitle} · ${deck.section.label.en}` : "Book flashcards" };
}

export default async function FlashcardDeckPage({ params }: PageProps<"/library/flashcards/[book]/[chapter]">) {
  await getCurrentUserId();
  const deck = await findDeck(params);
  if (!deck) notFound();
  const { book, section } = deck;
  const [released, isAdmin] = await Promise.all([getReleasedSections(book.slug), currentUserIsAdmin()]);

  const open = isDeckOpen(book, section.number, released);
  const access = open ? "open" : isAdmin ? "preview" : "locked";
  const following = book.sections.find((s) => s.number === section.number + 1);
  const next = following && (isAdmin || isDeckOpen(book, following.number, released)) ? { number: following.number, label: following.label } : undefined;

  return (
    <FlashcardDeckWrapper
      // Keyed by the deck, so moving to the next chapter starts a fresh round.
      key={`${book.slug}/${section.number}`}
      // Only these fields cross to the browser — never other chapters' cards, which may still be locked.
      book={{ slug: book.slug, shortTitle: book.shortTitle, chapters: book.chapters, source: book.source }}
      // A locked deck's cards aren't sent at all.
      section={access === "locked" ? { ...section, cards: [] } : section}
      next={next}
      access={access}
    />
  );
}
