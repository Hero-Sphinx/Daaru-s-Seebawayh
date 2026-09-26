import Link from "next/link";
import { QuizIcon } from "@/components";
import type { PlayableBookQuizQuestion } from "@/types";
import { BookQuizPlayer } from "./components";

export interface BookQuizWrapperProps {
  id: string;
  title: string;
  bank: PlayableBookQuizQuestion[];
  canRegenerate: boolean;
}

export default function BookQuizWrapper({ id, title, bank, canRegenerate }: BookQuizWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link href={`/library/${id}`} className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to {title}
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
          <QuizIcon className="h-5 w-5 text-teal-600" /> Book Quiz
        </h1>
        <p className="text-sm text-muted">{title}</p>
      </div>
      <BookQuizPlayer documentId={id} initialBank={bank} canRegenerate={canRegenerate} />
    </div>
  );
}
