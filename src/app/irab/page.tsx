import IrabWorkspace from "@/components/IrabWorkspace";
import { sampleSentence } from "@/lib/data/sample-sentence";

export default function IrabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">I&apos;rab Workspace</h1>
        <p className="text-neutral-500">
          Click a word to highlight its grammatical role across the sentence, the token card, and the dependency tree.
        </p>
      </div>
      <IrabWorkspace sentence={sampleSentence} />
    </div>
  );
}
