export * from "./bookQuiz";

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

/**
 * Library document access roles (ROADMAP.md Phase 5 sharing):
 *
 *   owner      — library_documents.owner_user_id; everything incl. delete/share
 *   annotator  — shared with role 'annotator'; read + add own notes
 *   viewer     — shared with role 'viewer'; read + see shared notes
 */
export type DocumentRole = "owner" | "annotator" | "viewer";

export interface AnnotationDTO {
  id: string;
  textUnitId: number;
  pageNumber: number | null;
  start: number;
  end: number;
  quote: string;
  note: string | null;
  visibility: "private" | "shared";
  authorName: string;
  mine: boolean;
  createdAt: string;
}

export interface FawaidDTO {
  id: number;
  pageNumber: number | null;
  category: string;
  title: string;
  bodyEn: string | null;
  bodyAr: string | null;
}

export interface ReaderPage {
  id: number;
  pageNumber: number | null;
  text: string;
  isOcr: boolean;
}

export interface DocumentShareDTO {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface LibraryPageData {
  documents: LibraryDocumentDTO[];
  /** The largest PDF this deployment accepts. */
  maxUploadBytes: number;
  shared: { doc: LibraryDocumentDTO; sharedBy: string }[];
}

export interface LibraryDocumentPageData {
  document: LibraryDocumentDTO;
  role: DocumentRole;
  userId: string;
  pages: ReaderPage[];
  annotations: AnnotationDTO[];
  shares: DocumentShareDTO[];
  fawaid: FawaidDTO[];
  /** Why extraction failed, or which scanned pages OCR couldn't recover. */
  extractionNote: string | null;
  initialPageIndex: number;
}
