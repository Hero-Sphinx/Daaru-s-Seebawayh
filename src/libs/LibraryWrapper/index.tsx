import Link from "next/link";
import { ArrowRightIcon, CardsIcon, ProcessingRefresher, ScrollIcon } from "@/components";
import { PageBanner } from "@/layouts";
import type { LibraryPageData } from "@/types";
import { LibraryDocumentCard, LibrarySearch, LibraryUpload } from "./components";

export default function LibraryWrapper({ documents, shared, maxUploadBytes }: LibraryPageData) {
  const anyProcessing = [...documents, ...shared.map((x) => x.doc)].some((d) => d.processingStatus === "processing");

  return (
    <div className="space-y-6">
      <ProcessingRefresher active={anyProcessing} />
      <PageBanner tone="sky" icon={ScrollIcon} titleAr="المَكْتَبَةُ" title="Library" description="Upload your books and lessons, read them with tap-a-word morphology and i'rab, search by root, and keep notes and fawā'id.">
        <LibraryUpload maxUploadBytes={maxUploadBytes} />
      </PageBanner>

      <Link
        href="/library/flashcards"
        className="group flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-emerald-900/50 dark:from-emerald-950/50 dark:to-amber-950/20"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition group-hover:scale-105">
          <CardsIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">
            Book flashcards <span className="font-arabic font-normal text-emerald-700 dark:text-emerald-300">· بِطَاقَاتُ المُرَاجَعَةِ</span>
          </span>
          <span className="block text-xs text-muted">Bilingual flashcards for the books we study — each book has its own decks, one per chapter.</span>
        </span>
        <ArrowRightIcon className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
      </Link>

      <LibrarySearch />

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/60 px-6 py-10 text-center dark:border-sky-900/60 dark:bg-sky-950/20">
          <p className="font-arabic text-3xl text-sky-800 dark:text-sky-300" lang="ar">
            خَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ
          </p>
          <p className="mt-1 text-xs text-muted">“The best companion in any age is a book.” — al-Mutanabbī</p>
          <p className="mt-4 text-sm text-foreground">Your shelf is empty — upload a PDF above to start reading.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <LibraryDocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {shared.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Shared with me</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shared.map(({ doc, sharedBy }) => (
              <LibraryDocumentCard key={doc.id} doc={doc} sharedBy={sharedBy} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
