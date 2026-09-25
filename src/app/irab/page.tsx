import { sampleSentences } from "@/constants/data/sampleSentences";
import { IrabWrapper } from "@/libs";

export default function IrabPage() {
  return <IrabWrapper sentences={sampleSentences} />;
}
