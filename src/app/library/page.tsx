import Link from "next/link";
import { recentDocuments } from "@/lib/data/mock-dashboard";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  processing: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  failed: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
};

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Maktabah</h1>
          <p className="text-neutral-500">Your uploaded texts, parsed and ready for study.</p>
        </div>
        <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
          Upload document
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentDocuments.map((doc) => (
          <Link
            key={doc.id}
            href={`/library/${doc.id}`}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-400 dark:hover:border-neutral-600 transition"
          >
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-medium">{doc.title}</h3>
              <span className={`text-xs rounded-full px-2 py-0.5 ${STATUS_STYLES[doc.processingStatus]}`}>
                {doc.processingStatus}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{doc.pageCount} pages</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
