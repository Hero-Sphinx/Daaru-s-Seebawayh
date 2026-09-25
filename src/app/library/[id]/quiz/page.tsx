import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { accessibleDocumentsWhere, isUuid } from "@/lib/library/access";
import BookQuizPlayer from "@/components/BookQuizPlayer";
import { QuizIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function BookQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  if (!isUuid(id)) notFound();
  const document = await db.library_documents.findFirst({ where: { id, ...accessibleDocumentsWhere(userId) } });
  if (!document) notFound();

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
