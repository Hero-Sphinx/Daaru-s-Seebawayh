import { notFound } from "next/navigation";
import { QuranChapterWrapper } from "@/libs";
import { getChapter, getVerses, VERSES_PER_PAGE } from "@/server/services/quran/queries";

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

  return <QuranChapterWrapper chapter={chapter} verses={verses} page={page} pageCount={pageCount} from={from} to={to} />;
}
