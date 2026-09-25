import { QuranWrapper } from "@/libs";
import { listChapters } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function QuranIndexPage() {
  return <QuranWrapper chapters={await listChapters()} />;
}
