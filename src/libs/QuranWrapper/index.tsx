import Link from "next/link";
import { MushafIcon } from "@/components";
import { PageBanner } from "@/layouts";
import type { QuranChapterDTO } from "@/types";

export default function QuranWrapper({ chapters }: { chapters: QuranChapterDTO[] }) {
  return (
    <div className="space-y-6">
      <PageBanner
        tone="teal"
        icon={MushafIcon}
        titleAr="القُرْآنُ الكَرِيمُ"
        title="The Qur'an, word by word"
        description={
          <>
            Every word&apos;s root, lemma, part of speech and case, from the{" "}
            <a href="https://corpus.quran.com" target="_blank" rel="noreferrer" className="font-medium text-teal-700 hover:underline dark:text-teal-300">
              Quranic Arabic Corpus
            </a>{" "}
            — verified scholarly annotation, no AI — with recitation for every word.
          </>
        }
      />
      {chapters.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          The corpus hasn&apos;t been imported into this database yet — run <code>npm run quran:import</code>.
        </p>
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((c) => (
          <li key={c.id}>
            <Link
              href={`/quran/${c.id}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md dark:hover:border-teal-700"
            >
              {/* The surah number inside an eight-pointed star (two overlapping squares). */}
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <span className="absolute inset-1 rounded-sm bg-teal-700 transition group-hover:bg-teal-600 dark:bg-teal-800" />
                <span className="absolute inset-1 rotate-45 rounded-sm bg-teal-700 transition group-hover:bg-teal-600 dark:bg-teal-800" />
                <span className="relative text-xs font-semibold text-amber-200">{c.id}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.nameTransliteration}</span>
                <span className="block truncate text-xs text-muted">
                  {c.nameEn} · {c.verseCount} verses · {c.revelationPlace === "medinan" ? "Medinan" : "Meccan"}
                </span>
              </span>
              <span dir="rtl" className="font-arabic text-xl text-emerald-900 dark:text-amber-200">
                {c.nameAr}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
