import { notFound } from "next/navigation";
import { BookQuizWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib/auth";
import { findAccessibleDocument } from "@/server/services/library/access";

export const dynamic = "force-dynamic";

export default async function BookQuizPage({ params }: PageProps<"/library/[id]/quiz">) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const document = await findAccessibleDocument(userId, id);
  if (!document) notFound();
  return <BookQuizWrapper id={id} document={document} />;
}
