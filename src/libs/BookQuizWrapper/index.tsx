import Link from "next/link";
import { QuizIcon } from "@/components/Icons";
import BookQuizPlayer from "./components/BookQuizPlayer";

export default function BookQuizWrapper({ id, document }: { id: string; document: { title: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <Link href={`/library/${id}`} className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to {document.title}
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
          <QuizIcon className="h-5 w-5 text-teal-600" /> Book Quiz
        </h1>
        <p className="text-sm text-muted">{document.title}</p>
      </div>
      <BookQuizPlayer documentId={id} />
    </div>
  );
}
