import Link from "next/link";
import { StoryIcon } from "@/components";
import { STORIES, STORY_LEVELS } from "@/constants";
import { paragraphWords } from "@/helpers";
import { PageBanner } from "@/layouts";

const LEVEL_TINT: Record<1 | 2 | 3, string> = {
  1: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  2: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  3: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
};

export default function StoriesWrapper() {
  return (
    <div className="space-y-8">
      <PageBanner
        tone="amber"
        icon={StoryIcon}
        titleAr="قِصَصٌ قَصِيرَةٌ"
        title="Stories"
        description={
          <>
            Short stories in simple, fully vowelled Arabic — for children and for anyone starting out. Tap a word you don&apos;t know… but give
            it a moment&apos;s thought first. You may know more than you think 😉
          </>
        }
      />

      {STORY_LEVELS.map(({ level, title, titleAr, description }) => {
        const stories = STORIES.filter((s) => s.level === level);
        if (stories.length === 0) return null;
        return (
          <section key={level} aria-labelledby={`level-${level}`} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id={`level-${level}`} className="text-lg font-semibold">
                {title}
              </h2>
              <span dir="rtl" className="font-arabic text-lg text-muted">
                {titleAr}
              </span>
            </div>
            <p className="text-sm text-muted">{description}</p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stories.map((story) => (
                <li key={story.slug}>
                  <Link
                    href={`/stories/${story.slug}`}
                    className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:hover:border-amber-700"
                  >
                    <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl transition group-hover:scale-105 dark:bg-amber-950/40">
                      {story.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span dir="rtl" className="block font-arabic text-xl leading-loose text-emerald-900 dark:text-amber-200">
                        {story.titleAr}
                      </span>
                      <span className="block text-sm font-medium">{story.titleEn}</span>
                      <span className="block text-xs text-muted">{story.blurb}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LEVEL_TINT[story.level]}`}>Level {story.level}</span>
                      <span className="text-[11px] text-muted">{story.paragraphs.flatMap(paragraphWords).length} words</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
