import Link from "next/link";
import { notFound } from "next/navigation";
import { recentDocuments, recentFawaid } from "@/lib/data/mock-dashboard";

export default async function DocumentReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = recentDocuments.find((d) => d.id === id);
  if (!doc) notFound();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <Link href="/library" className="text-sm text-sky-600 hover:underline">
          ← Back to library
        </Link>
        <h1 className="mt-2 mb-4 text-2xl font-semibold">{doc.title}</h1>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 min-h-[400px]">
          {doc.processingStatus === "completed" ? (
            <p dir="rtl" className="font-arabic text-2xl leading-loose text-neutral-700 dark:text-neutral-300">
              نَص تَجْرِيبِيّ يُمَثِّل صَفْحَة مِن الكِتَاب، حَيْثُ يُمْكِن للمُسْتَخْدِم النَّقْر عَلَى أَيّ كَلِمَة
              لِعَرْض تَحْلِيلهَا الصَّرْفِيّ وَالنَّحْوِيّ.
            </p>
          ) : (
            <p className="text-neutral-500">
              This document is still being tokenized and tagged (Farasa segmentation + POS tagging in progress).
              The reader and Fawā&apos;id extraction will appear here once processing completes.
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <h2 className="mb-2 font-medium">Fawā&apos;id from this text</h2>
          <ul className="space-y-2 text-sm">
            {recentFawaid.map((f) => (
              <li key={f.id} dir="rtl" className="font-arabic">
                {f.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <h2 className="mb-2 font-medium">Click a word to see I&apos;rab</h2>
          <p className="text-sm text-neutral-500">
            Tapping a word in the reader opens the same token-card + dependency-tree breakdown used in the{" "}
            <Link href="/irab" className="text-sky-600 hover:underline">
              I&apos;rab workspace
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
