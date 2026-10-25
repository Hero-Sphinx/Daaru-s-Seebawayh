import Link from "next/link";
import { CardsIcon, ChevronLeftIcon, LockIcon, ShieldIcon } from "@/components";
import { isDeckOpen } from "@/helpers";
import { PageBanner } from "@/layouts";
import type { FlashcardBook } from "@/types";

const TILE = "flex h-full items-start gap-3 rounded-2xl border p-4";

/**
 * One book's decks — one per chapter. Everything on this page belongs to this
 * book only. For a book released with the class, decks not yet taught show as
 * locked; an admin still sees and can open them (marked as hidden from students).
 */
export default function FlashcardBookWrapper({ book, released, isAdmin }: { book: FlashcardBook; released: number[]; isAdmin: boolean }) {
  const cardCount = book.sections.reduce((n, s) => n + s.cards.length, 0);
  const openCount = book.sections.filter((s) => isDeckOpen(book, s.number, released)).length;

  return (
    <div className="space-y-6">
      <Link href="/library/flashcards" className="flex w-fit items-center gap-1 text-sm font-medium text-sky-700 hover:underline dark:text-sky-300">
        <ChevronLeftIcon className="h-4 w-4" /> All books
      </Link>

      <PageBanner
        tone="sky"
        icon={CardsIcon}
        titleAr={book.title.ar}
        title={`${book.shortTitle} flashcards`}
        description={
          <>
            {book.author.en} · {book.blurb}
          </>
        }
      >
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-sky-800 shadow-sm dark:bg-white/10 dark:text-sky-200">
          {book.releasedWithClass ? `${openCount} of ${book.sections.length} ${book.chapters.en} open` : `${book.sections.length} ${book.chapters.en}`} · {cardCount} cards
        </span>
      </PageBanner>

      {book.releasedWithClass && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This book is taught in class — each {book.chapters.en.replace(/s$/, "")}&apos;s deck opens once it has been covered.
            {isAdmin && (
              <>
                {" "}
                <Link href="/admin" className="font-semibold underline">
                  Unlock decks
                </Link>
              </>
            )}
          </span>
        </p>
      )}

      <section aria-labelledby="decks" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="decks" className="text-lg font-semibold">
            Choose a deck <span className="text-sm font-normal text-muted">— practise only the {book.chapters.en} you&apos;ve covered</span>
          </h2>
          <span dir="rtl" lang="ar" className="font-arabic text-lg text-muted">
            {book.chapters.ar}
          </span>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {book.sections.map((section) => {
            const open = isDeckOpen(book, section.number, released);
            const body = (
              <>
                <span
                  aria-hidden
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm transition ${
                    open ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-amber-200 group-hover:scale-105" : "bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-300"
                  }`}
                >
                  {open ? section.number : <LockIcon className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span dir="rtl" lang="ar" className="block font-arabic text-lg leading-loose text-emerald-900 dark:text-amber-200">
                    {section.title.ar}
                  </span>
                  <span className="block text-sm font-medium leading-snug">
                    {open ? "" : `${section.number}. `}
                    {section.title.en}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {open ? `${section.cards.length} cards` : isAdmin ? "Locked — students can't see it yet (you can preview)" : "Opens after it's taught in class"}
                  </span>
                </span>
              </>
            );
            return (
              <li key={section.number}>
                {open || isAdmin ? (
                  <Link
                    href={`/library/flashcards/${book.slug}/${section.number}`}
                    className={`group ${TILE} bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md dark:hover:border-sky-700 ${
                      open ? "border-border" : "border-dashed border-amber-400/70"
                    }`}
                  >
                    {body}
                    {!open && <ShieldIcon className="h-4 w-4 shrink-0 text-amber-600" />}
                  </Link>
                ) : (
                  <div aria-disabled className={`${TILE} border-dashed border-border bg-surface/60 opacity-70`}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {book.source.english === "edition" ? (
        <p className="text-xs text-muted">
          The English and Arabic are quoted from the bilingual edition by{" "}
          <a href={book.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-700 dark:hover:text-sky-300">
            {book.source.name}
          </a>
          . Page numbers refer to that edition&apos;s PDF.
        </p>
      ) : (
        <p className="text-xs text-muted">
          The Arabic is quoted from{" "}
          <a href={book.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-700 dark:hover:text-sky-300">
            {book.source.name}
          </a>
          , and page numbers are the ones printed in it. That edition is Arabic only, so the English is our own translation, to help with
          revision — if anything reads wrongly, please tell us.
        </p>
      )}
    </div>
  );
}
