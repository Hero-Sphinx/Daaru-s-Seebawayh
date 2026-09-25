import "server-only";
import { after } from "next/server";
import { formatMegabytes, MAX_UPLOAD_BYTES, VERCEL_MAX_UPLOAD_BYTES } from "@/constants";
import { ApiError, badRequest } from "@/server/constants";
import { db } from "@/server/databases";
import type { LibraryDocumentDTO } from "@/types";
import { toLibraryDocumentDTO } from "./dto";
import { extractTextLayer, ocrPages, type ExtractedPage } from "./extractPdf";

/** The largest PDF this deployment can accept. */
export function uploadLimitBytes(): number {
  return process.env.VERCEL ? VERCEL_MAX_UPLOAD_BYTES : MAX_UPLOAD_BYTES;
}

export interface UploadResult {
  document: LibraryDocumentDTO & { notice?: string };
  /** 201 when every page was readable at once, 202 while scanned pages are still being transcribed. */
  status: 201 | 202;
}

/**
 * FR-2.1 PDF upload & parsing, in two stages:
 *
 * 1. In the request: the PDF's own text layer (fast, no network) is saved
 *    immediately.
 * 2. After the response (Next's `after()`): pages with no text layer are
 *    OCR'd by Gemini in small batches, each batch saved as it finishes, so
 *    the book fills in progressively and a failure late in a long book keeps
 *    everything before it. Confirmed live that doing OCR inside the request
 *    was untenable: 25-page batches timed out, and a long scanned book held
 *    the browser's upload request open for minutes.
 *
 * Progress lives on the document (processing_status) and its extraction_jobs
 * row. Only extracted text is kept; the PDF bytes are held in memory just
 * for the OCR pass (no object storage — see README.md). `after()` runs
 * in-process, which is fine for a Node server; on a serverless host it's
 * bounded by the route's maxDuration.
 */
export async function uploadDocument(userId: string, form: FormData): Promise<UploadResult> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) throw badRequest("Choose a PDF file to upload.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw badRequest("Only PDF files are supported.");
  const limit = uploadLimitBytes();
  if (file.size > limit) throw new ApiError(413, `That file is too large — the limit is ${formatMegabytes(limit)}.`);

  const title = (textField(form, "title") || file.name.replace(/\.pdf$/i, "")).slice(0, 300);
  const author = textField(form, "author").slice(0, 200) || null;

  const document = await db.library_documents.create({
    data: { owner_user_id: userId, title, author, file_type: "pdf", storage_path: file.name, processing_status: "processing" },
  });
  const job = await db.extraction_jobs.create({
    data: { document_id: document.id, job_type: "text_extraction", status: "running", started_at: new Date() },
  });

  const fail = async (message: string) => {
    await db.$transaction([
      db.library_documents.update({ where: { id: document.id }, data: { processing_status: "failed" } }),
      db.extraction_jobs.update({ where: { id: job.id }, data: { status: "failed", completed_at: new Date(), error_message: message } }),
    ]);
  };

  // --- stage 1: text layer
  let layer;
  try {
    layer = await extractTextLayer(await file.arrayBuffer());
  } catch (err) {
    const message = err instanceof Error ? `Couldn't read this PDF: ${err.message}` : "Couldn't read this PDF";
    await fail(message);
    throw new ApiError(422, message);
  }
  await savePages(document.id, layer.pages);
  await db.library_documents.update({ where: { id: document.id }, data: { page_count: layer.totalPages } });

  if (layer.emptyPageNumbers.length === 0) {
    await markDone(document.id, job.id, null);
    return { document: await documentDto(document.id), status: 201 };
  }

  // --- stage 2: OCR in the background
  const { pdfBase64, emptyPageNumbers } = layer;
  const textLayerPages = layer.pages.length;
  after(async () => {
    try {
      const r = await ocrPages(pdfBase64, emptyPageNumbers, (pages) => savePages(document.id, pages));
      const readable = textLayerPages + r.recovered;
      if (readable === 0) {
        await fail(
          r.quotaExhausted
            ? "This PDF needs OCR (no text layer), but Gemini's quota ran out before any page was transcribed. Quotas reset daily — delete and re-upload later."
            : r.notConfigured
              ? "This PDF has no text layer and OCR isn't configured (GEMINI_API_KEY)."
              : "No readable text could be extracted or transcribed from this PDF."
        );
        return;
      }
      const note =
        r.failedPages.length === 0
          ? null
          : r.quotaExhausted
            ? `Gemini's quota ran out: ${r.failedPages.length} scanned page(s) weren't transcribed. Re-upload later to get them.`
            : `${r.failedPages.length} scanned page(s) couldn't be transcribed: ${r.failedPages.join(", ")}.`;
      await markDone(document.id, job.id, note);
    } catch (err) {
      console.error("Background OCR crashed:", err);
      await fail("Transcription stopped unexpectedly. Delete and re-upload to try again.").catch(() => {});
    }
  });

  return {
    document: {
      ...(await documentDto(document.id)),
      notice: `${emptyPageNumbers.length} scanned page(s) are being transcribed in the background${
        textLayerPages > 0 ? ` — the ${textLayerPages} page(s) with a text layer are readable now` : ""
      }. This page refreshes as pages arrive.`,
    },
    status: 202,
  };
}

function textField(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}

async function savePages(documentId: string, pages: ExtractedPage[]) {
  if (pages.length === 0) return;
  await db.library_text_units.createMany({
    data: pages.map((p) => ({
      document_id: documentId,
      page_number: p.pageNumber,
      sequence_in_doc: p.pageNumber,
      raw_text: p.text,
      extraction_source: p.source,
      processing_status: "pending",
    })),
    // A page is only ever written once, but never let a retry double-insert.
    skipDuplicates: true,
  });
}

async function markDone(documentId: string, jobId: bigint, note: string | null) {
  await db.$transaction([
    db.library_documents.update({ where: { id: documentId }, data: { processing_status: "completed" } }),
    db.extraction_jobs.update({ where: { id: jobId }, data: { status: "completed", completed_at: new Date(), error_message: note } }),
  ]);
}

async function documentDto(documentId: string) {
  return toLibraryDocumentDTO(await db.library_documents.findUniqueOrThrow({ where: { id: documentId } }));
}
