import type { Metadata } from "next";
import { StoriesWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";

export const metadata: Metadata = { title: "Stories" };

export default async function StoriesPage() {
  await getCurrentUserId();
  return <StoriesWrapper />;
}
