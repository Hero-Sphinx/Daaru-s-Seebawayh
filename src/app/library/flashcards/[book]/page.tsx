import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findFlashcardBook } from "@/constants";
import { FlashcardBookWrapper } from "@/libs";
import { currentUserIsAdmin, getCurrentUserId } from "@/server/lib";
import { getReleasedSections } from "@/server/services";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/library/flashcards/[book]">): Promise<Metadata> {
  const book = findFlashcardBook((await params).book);
  return { title: book ? `${book.shortTitle} flashcards` : "Book flashcards" };
}

export default async function FlashcardBookPage({ params }: PageProps<"/library/flashcards/[book]">) {
  await getCurrentUserId();
  const book = findFlashcardBook((await params).book);
  if (!book) notFound();
  const [released, isAdmin] = await Promise.all([getReleasedSections(book.slug), currentUserIsAdmin()]);
  return <FlashcardBookWrapper book={book} released={released} isAdmin={isAdmin} />;
}
