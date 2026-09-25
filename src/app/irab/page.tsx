import IrabWorkspaceContainer from "@/components/IrabWorkspaceContainer";
import { sampleSentences } from "@/lib/data/sample-sentence";

export default function IrabPage() {
  return <IrabWorkspaceContainer sentences={sampleSentences} />;
}
