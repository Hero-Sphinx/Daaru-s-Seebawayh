import Link from "next/link";
import { notFound } from "next/navigation";
import QuranReader from "@/components/QuranReader";
import { getChapter, getVerses, VERSES_PER_PAGE } from "@/lib/quran/queries";

export const dynamic = "force-dynamic";

export default async function QuranChapterPage({ params, searchParams }: PageProps<"/quran/[chapter]">) {
  const { chapter: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  if (!Number.isInteger(chapterId) || chapterId < 1 || chapterId > 114) notFound();

  const chapter = await getChapter(chapterId);
  if (!chapter) notFound();

  const pageCount = Math.max(1, Math.ceil(chapter.verseCount / VERSES_PER_PAGE));
  const requested = Number((await searchParams).page ?? 1);
  const page = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), pageCount) : 1;
  const from = (page - 1) * VERSES_PER_PAGE + 1;
  const to = Math.min(page * VERSES_PER_PAGE, chapter.verseCount);
  const verses = await getVerses(chapterId, from, to);

  const pageLink = (p: number) => `/quran/${chapterId}${p > 1 ? `?page=${p}` : ""}`;

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-2xl border border-teal-700/40 bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-800 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/quran" className="text-xs font-medium text-teal-200 hover:text-white">
              ← All surahs
            </Link>
            <h1 className="mt-1 text-2xl font-bold">
              {chapter.id}. {chapter.nameTransliteration} <span className="font-normal text-teal-100/80">— {chapter.nameEn}</span>
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5">{chapter.verseCount} verses</span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5">{chapter.revelationPlace === "medinan" ? "Medinan" : "Meccan"}</span>
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-amber-200">
                verses {from}–{to}
              </span>
            </div>
          </div>
          <p dir="rtl" className="font-arabic text-4xl text-amber-200">
            سُورَةُ {chapter.nameAr}
          </p>
        </div>
        {/* The basmala opens every surah but al-Tawbah; in al-Fātiḥah it is the first verse itself. */}
        {from === 1 && chapter.id !== 1 && chapter.id !== 9 && (
          <p dir="rtl" lang="ar" className="relative z-10 mt-5 border-t border-white/15 pt-4 text-center font-arabic text-2xl text-white/95">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        )}
      </header>

      <QuranReader chapterId={chapterId} verses={verses} />

      {pageCount > 1 && (
        <nav className="flex items-center justify-between text-sm" aria-label="Verse pages">
          {page > 1 ? (
            <Link href={pageLink(page - 1)} className="rounded-xl border border-teal-300 bg-surface px-4 py-2 font-medium text-teal-800 shadow-sm transition hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/40">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-stone-500">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link href={pageLink(page + 1)} className="rounded-xl border border-teal-300 bg-surface px-4 py-2 font-medium text-teal-800 shadow-sm transition hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-950/40">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
