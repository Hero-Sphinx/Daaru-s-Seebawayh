import { notFound } from "next/navigation";
import { LibraryDocumentWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { getLibraryDocumentPage } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function DocumentReaderPage({ params, searchParams }: PageProps<"/library/[id]">) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const data = await getLibraryDocumentPage(userId, id, Number((await searchParams).page));
  if (!data) notFound();
  return <LibraryDocumentWrapper {...data} />;
}
