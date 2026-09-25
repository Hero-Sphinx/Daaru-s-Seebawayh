import { ScrollIcon } from "@/components/Icons";
import ProcessingRefresher from "@/components/ProcessingRefresher";
import PageBanner from "@/layouts/PageBanner";
import type { LibraryPageData } from "@/types/library";
import LibraryDocumentCard from "./components/LibraryDocumentCard";
import LibrarySearch from "./components/LibrarySearch";
import LibraryUpload from "./components/LibraryUpload";

export default function LibraryWrapper({ documents, shared }: LibraryPageData) {
  const anyProcessing = [...documents, ...shared.map((x) => x.doc)].some((d) => d.processingStatus === "processing");

  return (
    <div className="space-y-6">
      <ProcessingRefresher active={anyProcessing} />
      <PageBanner tone="sky" icon={ScrollIcon} titleAr="المَكْتَبَةُ" title="Library" description="Upload your books and lessons, read them with tap-a-word morphology and i'rab, search by root, and keep notes and fawā'id.">
        <LibraryUpload />
      </PageBanner>

      <LibrarySearch />

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/60 px-6 py-10 text-center dark:border-sky-900/60 dark:bg-sky-950/20">
          <p className="font-arabic text-3xl text-sky-800 dark:text-sky-300" lang="ar">
            خَيْرُ جَلِيسٍ فِي الزَّمَانِ كِتَابُ
          </p>
          <p className="mt-1 text-xs text-muted">“The best companion in any age is a book.” — al-Mutanabbī</p>
          <p className="mt-4 text-sm text-foreground">Your shelf is empty — upload a PDF or text file above to start reading.</p>
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
