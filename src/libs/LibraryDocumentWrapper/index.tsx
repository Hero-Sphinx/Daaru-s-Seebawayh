import Link from "next/link";
import { QuizIcon, ScrollIcon } from "@/components/Icons";
import ProcessingRefresher from "@/components/ProcessingRefresher";
import { canAnnotate } from "@/helpers/library/annotations";
import type { LibraryDocumentPageData } from "@/types/library";
import LibraryReader from "./components/LibraryReader";
import LibrarySharePanel from "./components/LibrarySharePanel";
import LibrarySummary from "./components/LibrarySummary";

export default function LibraryDocumentWrapper({
  document,
  role,
  userId,
  pages,
  annotations,
  shares,
  fawaid,
  extractionNote,
  initialPageIndex,
}: LibraryDocumentPageData) {
  const processing = document.processingStatus === "processing";

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
      {document.processingStatus === "completed" && extractionNote && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {extractionNote}
        </p>
      )}

      {document.processingStatus === "failed" || pages.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center dark:border-stone-700/60 dark:bg-parchment-800">
          <p className="text-muted">
            {document.processingStatus === "failed"
              ? (extractionNote ?? "Text extraction failed for this document.")
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
