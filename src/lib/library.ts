export interface LibraryDocumentDTO {
  id: string;
  title: string;
  author: string | null;
  pageCount: number | null;
  processingStatus: string;
  uploadedAt: string;
  summaryEn: string | null;
  summaryAr: string | null;
  summaryGeneratedAt: string | null;
}

export interface LibraryDocumentRow {
  id: string;
  title: string;
  author: string | null;
  page_count: number | null;
  processing_status: string;
  uploaded_at: Date;
  summary_en: string | null;
  summary_ar: string | null;
  summary_generated_at: Date | null;
}

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

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB — generous for a text-heavy book PDF, not a scanned-image one
