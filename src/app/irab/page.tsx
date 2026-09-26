import { sampleSentences } from "@/constants";
import { IrabWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";

export default async function IrabPage() {
  await getCurrentUserId();
  return <IrabWrapper sentences={sampleSentences} />;
}
