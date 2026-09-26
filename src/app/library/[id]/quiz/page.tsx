import { notFound } from "next/navigation";
import { BookQuizWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { findAccessibleDocument, getBookQuiz, getDocumentRole } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function BookQuizPage({ params }: PageProps<"/library/[id]/quiz">) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const document = await findAccessibleDocument(userId, id);
  if (!document) notFound();
  const [bank, role] = await Promise.all([getBookQuiz(userId, id), getDocumentRole(userId, id)]);
  return <BookQuizWrapper id={id} title={document.title} bank={bank} canRegenerate={role === "owner"} />;
}
