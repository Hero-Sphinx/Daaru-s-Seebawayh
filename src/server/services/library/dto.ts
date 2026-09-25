import "server-only";
import type { library_documents } from "@/generated/prisma/client";
import type { LibraryDocumentDTO } from "@/types";

export type LibraryDocumentRow = Pick<
  library_documents,
  "id" | "title" | "author" | "page_count" | "processing_status" | "uploaded_at" | "summary_en" | "summary_ar" | "summary_generated_at"
>;

export function toLibraryDocumentDTO(row: LibraryDocumentRow): LibraryDocumentDTO {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    pageCount: row.page_count,
    processingStatus: row.processing_status,
    uploadedAt: row.uploaded_at.toISOString(),
    summaryEn: row.summary_en,
    summaryAr: row.summary_ar,
    summaryGeneratedAt: row.summary_generated_at ? row.summary_generated_at.toISOString() : null,
  };
}
