import type { Metadata } from "next";
import { GuideWrapper } from "@/libs";
import { getSessionUser } from "@/server/lib/auth";

export const metadata: Metadata = { title: "How to use" };

export default async function GuidePage() {
  return <GuideWrapper signedIn={Boolean(await getSessionUser())} />;
}
