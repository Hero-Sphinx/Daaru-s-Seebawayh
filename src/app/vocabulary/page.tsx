import { VocabularyWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { getVocabularyPage } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const userId = await getCurrentUserId();
  return <VocabularyWrapper {...await getVocabularyPage(userId)} />;
}
