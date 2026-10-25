import type { Metadata } from "next";
import { FlashcardsWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { getAllReleasedSections } from "@/server/services";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book flashcards" };

export default async function FlashcardsPage() {
  await getCurrentUserId();
  return <FlashcardsWrapper released={await getAllReleasedSections()} />;
}
