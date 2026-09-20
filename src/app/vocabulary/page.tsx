import VocabularyPractice from "@/components/VocabularyPractice";
import { mockVocabularyQueue } from "@/lib/data/mock-vocabulary";

export default function VocabularyPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Review queue</h1>
        <p className="text-neutral-500">SM-2 spaced repetition — grade your recall honestly.</p>
      </div>
      <VocabularyPractice initialQueue={mockVocabularyQueue} />
    </div>
  );
}
