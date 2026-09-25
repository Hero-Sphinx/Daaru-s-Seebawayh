import "server-only";
import { notFound } from "@/server/constants";
import { db } from "@/server/databases";
import { accessibleDocumentsWhere, findAccessibleDocument, isUuid } from "./access";
import { toLibraryDocumentDTO } from "./dto";

export async function listDocuments(userId: string) {
  const documents = await db.library_documents.findMany({ where: accessibleDocumentsWhere(userId), orderBy: { uploaded_at: "desc" } });
  return documents.map(toLibraryDocumentDTO);
}

/** A document with its pages and fawā'id (API shape). */
export async function getDocument(userId: string, id: string) {
  const document = await findAccessibleDocument(userId, id);
  if (!document) throw notFound();
  const textUnits = await db.library_text_units.findMany({ where: { document_id: id }, orderBy: { sequence_in_doc: "asc" }, include: { fawaid: true } });
  return {
    document: toLibraryDocumentDTO(document),
    pages: textUnits.map((u) => ({ id: Number(u.id), pageNumber: u.page_number, text: u.raw_text })),
    fawaid: textUnits.flatMap((u) =>
      u.fawaid.map((f) => ({ id: Number(f.id), pageNumber: u.page_number, category: f.category, title: f.title, bodyEn: f.body_en, bodyAr: f.body_ar }))
    ),
  };
}

/** Owner only — deleting also removes it for everyone it's shared with. */
export async function deleteDocument(userId: string, id: string): Promise<void> {
  const result = isUuid(id) ? await db.library_documents.deleteMany({ where: { id, owner_user_id: userId } }) : { count: 0 };
  if (result.count === 0) throw notFound();
}
