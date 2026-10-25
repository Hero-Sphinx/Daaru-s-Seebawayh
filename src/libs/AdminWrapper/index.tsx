import Link from "next/link";
import { CheckIcon, LockIcon, ShieldIcon } from "@/components";
import { FLASHCARD_BOOKS } from "@/constants";
import { isDeckOpen } from "@/helpers";
import { PageBanner } from "@/layouts";
import { ReleaseToggle } from "./components";

/**
 * Admin tools. For now: releasing class flashcards. After each lesson, unlock
 * the decks the class covered — one per principle, however many days it took.
 * Students see a deck as soon as it's unlocked; locking hides it again.
 */
export default function AdminWrapper({ released }: { released: Record<string, number[]> }) {
  const classBooks = FLASHCARD_BOOKS.filter((b) => b.releasedWithClass);

  return (
    <div className="space-y-8">
      <PageBanner
        tone="stone"
        icon={ShieldIcon}
        titleAr="الإِدَارَةُ"
        title="Admin"
        description="Only admins see this page. After each class, unlock the flashcard decks for what was covered."
      />

      {classBooks.map((book) => {
        const open = released[book.slug] ?? [];
        const openCount = book.sections.filter((s) => isDeckOpen(book, s.number, open)).length;
        const nextLocked = book.sections.find((s) => !isDeckOpen(book, s.number, open));
        return (
          <section key={book.slug} aria-labelledby={`release-${book.slug}`} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <div>
                <h2 id={`release-${book.slug}`} className="text-lg font-semibold">
                  {book.shortTitle} flashcards
                </h2>
                <p className="text-sm text-muted">
                  {openCount} of {book.sections.length} {book.chapters.en} open to students
                  {nextLocked ? ` · next to unlock: ${nextLocked.label.en.replace("The ", "the ")}` : " · all open"}
                </p>
              </div>
              <Link href={`/library/flashcards/${book.slug}`} className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-300">
                See it as students do →
              </Link>
            </div>

            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {book.sections.map((s) => {
                const isOpen = isDeckOpen(book, s.number, open);
                return (
                  <li key={s.number} className={`flex items-center gap-3 px-4 py-3 ${s === nextLocked ? "bg-emerald-50/70 dark:bg-emerald-950/30" : ""}`}>
                    <span
                      aria-hidden
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isOpen ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-300"
                      }`}
                    >
                      {isOpen ? <CheckIcon className="h-4 w-4" /> : <LockIcon className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {s.number}. {s.title.en}
                      </span>
                      <span dir="rtl" lang="ar" className="block font-arabic text-base leading-loose text-muted">
                        {s.title.ar}
                      </span>
                      <span className="block text-xs text-muted">
                        {s.cards.length} cards · {isOpen ? "open to students" : "locked"}
                      </span>
                    </span>
                    <ReleaseToggle book={book.slug} section={s.number} released={isOpen} label={s.label.en} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {classBooks.length === 0 && <p className="text-sm text-muted">No book is released with a class yet.</p>}
    </div>
  );
}
