import QuizCenter from "@/components/QuizCenter";
import { QuizIcon } from "@/components/icons";
import PageBanner from "@/components/PageBanner";

export default function QuizzesPage() {
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
