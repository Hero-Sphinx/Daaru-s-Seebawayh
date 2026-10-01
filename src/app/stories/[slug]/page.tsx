import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findStory } from "@/constants";
import { StoryWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { listVocabularyWordKeys } from "@/server/services";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const story = findStory((await params).slug);
  return { title: story ? story.titleEn : "Stories" };
}

export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const userId = await getCurrentUserId();
  const story = findStory((await params).slug);
  if (!story) notFound();
  return <StoryWrapper story={story} knownWordKeys={await listVocabularyWordKeys(userId)} />;
}
