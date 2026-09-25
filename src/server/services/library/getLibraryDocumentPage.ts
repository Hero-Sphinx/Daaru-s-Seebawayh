import "server-only";
import { nowMs } from "@/helpers";
import { db } from "@/server/databases";
import type { AnnotationDTO, LibraryDocumentPageData } from "@/types";
import { getDocumentRole, isUuid } from "./access";
import { toLibraryDocumentDTO } from "./dto";

/** Background OCR still "running" after this long was killed by a restart. */
const STALE_JOB_MS = 30 * 60 * 1000;

/** Everything the reader page needs, or null when the user can't see the document (render a 404). */
export async function getLibraryDocumentPage(userId: string, id: string, requestedPage: number): Promise<LibraryDocumentPageData | null> {
  if (!isUuid(id)) return null;
  const role = await getDocumentRole(userId, id);
  if (!role) return null;

  const [documentRow, textUnits, annotationRows, shareRows] = await Promise.all([
    db.library_documents.findUniqueOrThrow({ where: { id } }),
    db.library_text_units.findMany({ where: { document_id: id }, orderBy: { sequence_in_doc: "asc" }, include: { fawaid: true } }),
    // Everyone's shared notes + this user's own private ones — never someone else's private note.
    db.library_annotations.findMany({
      where: { document_id: id, OR: [{ visibility: "shared" }, { user_id: userId }] },
      include: { users: { select: { display_name: true, email: true } } },
      orderBy: { start_offset: "asc" },
    }),
    role === "owner"
      ? db.library_document_shares.findMany({
          where: { document_id: id },
          include: { users: { select: { id: true, display_name: true, email: true } } },
          orderBy: { created_at: "asc" },
        })
      : Promise.resolve([]),
  ]);
  const document = toLibraryDocumentDTO(documentRow);

  const pages = textUnits.map((u) => ({ id: Number(u.id), pageNumber: u.page_number, text: u.raw_text, isOcr: u.extraction_source === "ocr" }));
  const pageNumberByUnit = new Map(textUnits.map((u) => [Number(u.id), u.page_number]));
  const annotations: AnnotationDTO[] = annotationRows.map((a) => ({
    id: a.id.toString(),
    textUnitId: Number(a.text_unit_id),
    pageNumber: pageNumberByUnit.get(Number(a.text_unit_id)) ?? null,
    start: a.start_offset,
    end: a.end_offset,
    quote: a.quote,
    note: a.note,
    visibility: a.visibility === "private" ? "private" : "shared",
    authorName: a.users.display_name ?? a.users.email,
    mine: a.user_id === userId,
    createdAt: a.created_at.toISOString(),
  }));

  // The latest extraction job carries why a book failed, or which pages OCR couldn't recover.
  const latestJob = await db.extraction_jobs.findFirst({
    where: { document_id: id, job_type: "text_extraction" },
    orderBy: { id: "desc" },
    select: { id: true, status: true, started_at: true, error_message: true },
  });
  let extractionNote = latestJob?.error_message ?? null;
  // Background OCR runs in-process (after()); a server restart mid-run kills it
  // and would leave the book "processing" forever. A job running this long is
  // treated as interrupted.
  if (
    document.processingStatus === "processing" &&
    latestJob?.status === "running" &&
    latestJob.started_at &&
    nowMs() - latestJob.started_at.getTime() > STALE_JOB_MS
  ) {
    extractionNote =
      pages.length > 0
        ? "Transcription was interrupted (the server restarted). The pages below are what finished — re-upload to get the rest."
        : "Transcription was interrupted (the server restarted) before any page finished. Delete and re-upload to try again.";
    const status = pages.length > 0 ? "completed" : "failed";
    await db.$transaction([
      db.library_documents.update({ where: { id }, data: { processing_status: status } }),
      db.extraction_jobs.update({ where: { id: latestJob.id }, data: { status: "failed", completed_at: new Date(), error_message: extractionNote } }),
    ]);
    document.processingStatus = status;
  }

  return {
    document,
    role,
    userId,
    pages,
    annotations,
    shares: shareRows.map((sh) => ({ userId: sh.users.id, name: sh.users.display_name ?? sh.users.email, email: sh.users.email, role: sh.role })),
    fawaid: textUnits.flatMap((u) =>
      u.fawaid.map((f) => ({ id: Number(f.id), pageNumber: u.page_number, category: f.category, title: f.title, bodyEn: f.body_en, bodyAr: f.body_ar }))
    ),
    extractionNote,
    // ?page=N (e.g. from a search result) opens the reader on that page.
    initialPageIndex: Number.isInteger(requestedPage) ? Math.max(0, pages.findIndex((p) => p.pageNumber === requestedPage)) : 0,
  };
}
