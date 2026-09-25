import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { toLibraryDocumentDTO, type LibraryDocumentRow } from "@/lib/library";
import LibraryReader from "@/components/LibraryReader";
import LibrarySummary from "@/components/LibrarySummary";
import { QuizIcon, ScrollIcon } from "@/components/icons";
import LibrarySharePanel from "@/components/LibrarySharePanel";
import ProcessingRefresher from "@/components/ProcessingRefresher";
import { canAnnotate, getDocumentRole, isUuid } from "@/lib/library/access";
import type { AnnotationDTO } from "@/lib/library/annotations";
import { nowMs } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Background OCR still "running" after this long was killed by a restart. */
const STALE_JOB_MS = 30 * 60 * 1000;

export default async function DocumentReaderPage({ params, searchParams }: PageProps<"/library/[id]">) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  if (!isUuid(id)) notFound();

  const role = await getDocumentRole(userId, id);
  if (!role) notFound();
  const documentRow = await db.library_documents.findUniqueOrThrow({ where: { id } });
  const document = toLibraryDocumentDTO(documentRow as unknown as LibraryDocumentRow);

  const textUnits = await db.library_text_units.findMany({
    where: { document_id: id },
    orderBy: { sequence_in_doc: "asc" },
    include: { fawaid: true },
  });
  const pages = textUnits.map((u) => ({
    id: Number(u.id),
    pageNumber: u.page_number,
    text: u.raw_text,
    isOcr: u.extraction_source === "ocr",
  }));
  // Everyone's shared notes + this user's own private ones — never someone else's private note.
  const annotationRows = await db.library_annotations.findMany({
    where: { document_id: id, OR: [{ visibility: "shared" }, { user_id: userId }] },
    include: { users: { select: { display_name: true, email: true } } },
    orderBy: { start_offset: "asc" },
  });
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

  const shares =
    role === "owner"
      ? (
          await db.library_document_shares.findMany({
            where: { document_id: id },
            include: { users: { select: { id: true, display_name: true, email: true } } },
            orderBy: { created_at: "asc" },
          })
        ).map((sh) => ({ userId: sh.users.id, name: sh.users.display_name ?? sh.users.email, email: sh.users.email, role: sh.role }))
      : [];

  // The latest extraction job carries why a book failed, or which pages OCR couldn't recover.
  let latestJob = await db.extraction_jobs.findFirst({
    where: { document_id: id, job_type: "text_extraction" },
    orderBy: { id: "desc" },
    select: { id: true, status: true, started_at: true, error_message: true },
  });
  // Background OCR runs in-process (after()); a server restart mid-run kills it
  // and would leave the book "processing" forever. A job running this long is
  // treated as interrupted.
  if (
    document.processingStatus === "processing" &&
    latestJob?.status === "running" &&
    latestJob.started_at &&
    nowMs() - latestJob.started_at.getTime() > STALE_JOB_MS
  ) {
    const message =
      pages.length > 0
        ? "Transcription was interrupted (the server restarted). The pages below are what finished — re-upload to get the rest."
        : "Transcription was interrupted (the server restarted) before any page finished. Delete and re-upload to try again.";
    const status = pages.length > 0 ? "completed" : "failed";
    await db.$transaction([
      db.library_documents.update({ where: { id }, data: { processing_status: status } }),
      db.extraction_jobs.update({ where: { id: latestJob.id }, data: { status: "failed", completed_at: new Date(), error_message: message } }),
    ]);
    document.processingStatus = status;
    latestJob = { ...latestJob, status: "failed", error_message: message };
  }
  const processing = document.processingStatus === "processing";

  // ?page=N (e.g. from a search result) opens the reader on that page.
  const requestedPage = Number((await searchParams).page);
  const initialPageIndex = Number.isInteger(requestedPage) ? Math.max(0, pages.findIndex((p) => p.pageNumber === requestedPage)) : 0;

  const fawaid = textUnits.flatMap((u) =>
    u.fawaid.map((f) => ({
      id: Number(f.id),
      pageNumber: u.page_number,
      category: f.category,
      title: f.title,
      bodyEn: f.body_en,
      bodyAr: f.body_ar,
    }))
  );

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm dark:border-sky-900/50 dark:from-sky-950/60 dark:via-parchment-800 dark:to-indigo-950/40 sm:p-6">
        <span aria-hidden className="site-chrome pointer-events-none absolute -bottom-6 -left-2 select-none text-[96px] font-bold leading-none text-sky-700 opacity-[0.07]">
          <span className="font-arabic">كِتَابٌ</span>
        </span>
        <div className="relative flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
              <ScrollIcon className="h-6 w-6" />
            </span>
            <div>
              <Link href="/library" className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300">
                ← Back to library
              </Link>
              <h1 className="text-2xl font-bold leading-tight text-foreground">{document.title}</h1>
              {document.author && <p className="text-sm text-muted">{document.author}</p>}
            </div>
          </div>
          {document.processingStatus === "completed" && (
            <Link
              href={`/library/${document.id}/quiz`}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-400"
            >
              <QuizIcon className="h-4 w-4" /> Take a quiz on this book
            </Link>
          )}
        </div>
      </header>

      <ProcessingRefresher active={processing} />

      {processing && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <span className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
          Transcribing scanned pages in the background — {pages.length} of {document.pageCount ?? "?"} pages ready. This page
          updates automatically; you can start reading what&apos;s here.
        </p>
      )}
      {document.processingStatus === "completed" && latestJob?.error_message && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {latestJob.error_message}
        </p>
      )}

      {document.processingStatus === "failed" || pages.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-stone-700/60 dark:bg-parchment-800">
          <p className="text-muted">
            {document.processingStatus === "failed"
              ? (latestJob?.error_message ?? "Text extraction failed for this document.")
              : "Reading the PDF — the first pages will appear here shortly…"}
          </p>
        </div>
      ) : (
        <>
          <LibraryReader
            pages={pages}
            documentId={document.id}
            annotations={annotations}
            canAnnotate={canAnnotate(role)}
            isOwner={role === "owner"}
            initialPageIndex={initialPageIndex}
          />
          <LibrarySharePanel documentId={document.id} role={role} shares={shares} currentUserId={userId} />
          {document.processingStatus === "completed" && (
            <LibrarySummary
              documentId={document.id}
              summaryEn={document.summaryEn}
              summaryAr={document.summaryAr}
              fawaid={fawaid}
              canGenerate={role === "owner"}
            />
          )}
        </>
      )}
    </div>
  );
}
