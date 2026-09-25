import Link from "next/link";
import { AwardIcon, BookIcon, DiagramIcon, GraduationCapIcon, MushafIcon, QuizIcon, ScrollIcon } from "@/components/Icons";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/Icons";
import type { DashboardData } from "@/types/dashboard";
import WisdomCard from "./components/WisdomCard";

const PANEL = "rounded-lg border border-border bg-surface";

/** Same colours as the fawā'id cards in the reader (LibrarySummary). */
const FAWAID_CHIPS: Record<string, [string, string]> = {
  vocabulary: ["Vocabulary", "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"],
  balaghah: ["Balāghah", "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"],
  idiom: ["Idiom", "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"],
  grammar_note: ["Grammar", "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"],
  other: ["Benefit", "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"],
};

function Stat({ label, value, href, icon: Icon, tint }: { label: string; value: string; href: string; icon: ComponentType<IconProps>; tint: string }) {
  return (
    <Link href={href} className={`${PANEL} flex items-center gap-3 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-2xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="block text-xs text-muted">{label}</span>
      </span>
    </Link>
  );
}

const MODULES: { href: string; icon: ComponentType<IconProps>; title: string; titleAr: string; description: string; tint: string }[] = [
  {
    href: "/vocabulary",
    tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    icon: BookIcon,
    title: "Vocabulary",
    titleAr: "المُفْرَدَات",
    description: "Your word bank with roots and plurals, reviewed by spaced repetition.",
  },
  {
    href: "/irab",
    tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    icon: DiagramIcon,
    title: "I'rab",
    titleAr: "الإِعْرَاب",
    description: "Write the full analysis of a sentence and have it checked word by word.",
  },
  {
    href: "/quran",
    tint: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    icon: MushafIcon,
    title: "Qur'an",
    titleAr: "القُرْآن",
    description: "Read with word-by-word morphology and recitation from the Quranic Arabic Corpus.",
  },
  {
    href: "/library",
    tint: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    icon: ScrollIcon,
    title: "Library",
    titleAr: "المَكْتَبَة",
    description: "Upload texts, search by root, annotate, and extract fawā'id.",
  },
  {
    href: "/quizzes",
    tint: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    icon: QuizIcon,
    title: "Quizzes",
    titleAr: "الاخْتِبَارَات",
    description: "Vocabulary, I'rab and ṣarf questions generated from your own material.",
  },
];

export default function DashboardWrapper({
  name,
  cardsDueToday,
  wordsMastered,
  quizAccuracyLabel,
  documentsInLibrary,
  recentDocuments,
  recentFawaid,
  wisdomIndex,
  timeZone,
}: DashboardData) {
  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-emerald-700/40 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-xl md:p-8">
        {/* اقْرَأْ — the first word revealed. */}
        <span
          aria-hidden
          className="site-chrome pointer-events-none absolute -bottom-10 -right-6 select-none text-[150px] font-bold leading-none text-amber-300 opacity-10 sm:text-[210px]"
        >
          <span className="font-arabic">اقْرَأْ</span>
        </span>
        <div className="relative z-10 max-w-2xl">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            <span className="font-arabic text-sm">السَّلَامُ عَلَيْكُمْ</span> · Welcome back
          </span>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-4xl">{name ? `Welcome back, ${name}.` : "Here's where you left off."}</h1>
          <p className="mb-6 text-sm leading-relaxed text-emerald-100 sm:text-base">
            {cardsDueToday > 0 ? `You have ${cardsDueToday} card${cardsDueToday === 1 ? "" : "s"} due for review. ` : "No reviews due right now. "}
            Build vocabulary, master grammatical analysis (<span className="font-arabic font-semibold text-amber-200">إِعْرَاب</span>), and draw
            benefits (<span className="font-arabic font-semibold text-amber-200">فَوَائِد</span>) from what you read.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/vocabulary"
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-emerald-950 shadow-lg transition hover:bg-amber-400"
            >
              <BookIcon className="h-4 w-4" /> {cardsDueToday > 0 ? "Start review" : "Practice vocabulary"}
            </Link>
            <Link
              href="/irab"
              className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-950/40 px-5 py-2.5 font-medium text-emerald-50 transition hover:bg-emerald-700"
            >
              <DiagramIcon className="h-4 w-4" /> Analyse a sentence
            </Link>
          </div>
        </div>
      </header>

      <section aria-label="Progress" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Cards due today" value={String(cardsDueToday)} href="/vocabulary" icon={BookIcon} tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" />
        <Stat label="Words mastered" value={String(wordsMastered)} href="/vocabulary" icon={AwardIcon} tint="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" />
        <Stat label="Quiz accuracy (7 days)" value={quizAccuracyLabel} href="/quizzes" icon={GraduationCapIcon} tint="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300" />
        <Stat label="Documents in library" value={String(documentsInLibrary)} href="/library" icon={ScrollIcon} tint="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300" />
      </section>

      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="mb-3 text-sm font-semibold text-foreground">
          Study
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ href, icon: Icon, title, titleAr, description, tint }) => (
            <Link key={href} href={href} className={`${PANEL} group flex gap-4 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground group-hover:text-brand">{title}</span>
                  <span className="font-arabic text-sm text-muted" lang="ar">
                    {titleAr}
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <WisdomCard index={wisdomIndex} serverTimeZone={timeZone} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className={PANEL}>
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Recent documents</h2>
            <Link href="/library" className="text-xs text-brand hover:underline">
              Open library
            </Link>
          </div>
          {recentDocuments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">No documents yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {recentDocuments.map((doc) => (
                <li key={doc.id}>
                  <Link href={`/library/${doc.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-background">
                    <span className="truncate text-foreground">{doc.title}</span>
                    <span className={`shrink-0 text-xs ${doc.processing_status === "completed" ? "text-muted" : "text-accent"}`}>
                      {doc.processing_status === "completed" ? "Ready" : doc.processing_status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={PANEL}>
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">Recent fawā&apos;id</h2>
          </div>
          {recentFawaid.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">None yet — generate a summary on a library document to extract some.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {recentFawaid.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <span dir="rtl" lang="ar" className="font-arabic text-foreground">
                    {f.title}
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${(FAWAID_CHIPS[f.category] ?? FAWAID_CHIPS.other)[1]}`}>
                    {(FAWAID_CHIPS[f.category] ?? FAWAID_CHIPS.other)[0]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
