import { QuranWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { listChapters } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function QuranIndexPage() {
  await getCurrentUserId();
  return <QuranWrapper chapters={await listChapters()} />;
}
