import { QuizIcon } from "@/components/Icons";
import PageBanner from "@/layouts/PageBanner";
import QuizCenter from "./components/QuizCenter";

export default function QuizzesWrapper() {
  return (
    <div className="space-y-6">
      <PageBanner
        tone="rose"
        icon={QuizIcon}
        titleAr="الاخْتِبَارَاتُ"
        title="Quiz Center"
        description="Test yourself on vocabulary, i'rab and ṣarf. Questions come from your own word bank, the Quranic Arabic Corpus and checked examples, with believable wrong options — and every result is saved."
      />
      <QuizCenter />
    </div>
  );
}
