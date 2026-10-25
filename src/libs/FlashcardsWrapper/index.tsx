import Link from "next/link";
import { CardsIcon, ChevronLeftIcon } from "@/components";
import { FEEDBACK_EMAIL, FLASHCARD_BOOKS } from "@/constants";
import { openDeckCount } from "@/helpers";
import { PageBanner } from "@/layouts";
import { type FlashcardBookSummary, FlashcardShelf } from "./components";

/** The shelf: one entry per book. Each opens that book's own decks, so a learner only ever sees one book's cards at a time. */
export default function FlashcardsWrapper({ released }: { released: Record<string, number[]> }) {
  // Only what the shelf shows goes to the browser — not every card of every book.
  const books: FlashcardBookSummary[] = FLASHCARD_BOOKS.map((b) => ({
    slug: b.slug,
    titleEn: b.title.en,
    titleAr: b.title.ar,
    shortTitle: b.shortTitle,
    authorEn: b.author.en,
    subject: b.subject,
    blurb: b.blurb,
    chaptersEn: b.chapters.en,
    deckCount: b.sections.length,
    openCount: openDeckCount(b, released[b.slug] ?? []),
    releasedWithClass: Boolean(b.releasedWithClass),
    cardCount: b.sections.reduce((n, s) => n + s.cards.length, 0),
  }));

  return (
    <div className="space-y-8">
      <Link href="/library" className="flex w-fit items-center gap-1 text-sm font-medium text-sky-700 hover:underline dark:text-sky-300">
        <ChevronLeftIcon className="h-4 w-4" /> Library
      </Link>

      <PageBanner
        tone="sky"
        icon={CardsIcon}
        titleAr="بِطَاقَاتُ المُرَاجَعَةِ"
        title="Book flashcards"
        description="Flashcards for the books students study, in Arabic and English. Pick a book to see its decks — one per chapter, so you practise only what you've covered."
      />

      <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <strong>More books coming soon, In Shā Allāh.</strong> If there&apos;s a book you&apos;d like us to add, kindly email us at{" "}
        <a
          href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Book flashcards request")}`}
          className="font-semibold underline decoration-amber-400 underline-offset-2 hover:text-amber-700 dark:hover:text-amber-200"
        >
          {FEEDBACK_EMAIL}
        </a>
        .
      </p>

      <FlashcardShelf books={books} />
    </div>
  );
}
