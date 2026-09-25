import db from "@/server/databases/db";
import type { LibraryPageData } from "@/types/library";
import { toLibraryDocumentDTO } from "./dto";

export async function getLibraryPage(userId: string): Promise<LibraryPageData> {
  const [rows, sharedRows] = await Promise.all([
    db.library_documents.findMany({ where: { owner_user_id: userId }, orderBy: { uploaded_at: "desc" } }),
    db.library_documents.findMany({
      where: { library_document_shares: { some: { user_id: userId } } },
      include: { users: { select: { display_name: true, email: true } } },
      orderBy: { uploaded_at: "desc" },
    }),
  ]);
  return {
    documents: rows.map(toLibraryDocumentDTO),
    shared: sharedRows.map((r) => ({ doc: toLibraryDocumentDTO(r), sharedBy: r.users?.display_name ?? r.users?.email ?? "someone" })),
  };
}
