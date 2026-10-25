"use client";

import Link from "next/link";
import { useState } from "react";
import { CardsIcon } from "@/components";
import { normalizeArabicForSearch } from "@/helpers";

export interface FlashcardBookSummary {
  slug: string;
  titleEn: string;
  titleAr: string;
  shortTitle: string;
  authorEn: string;
  subject: string;
  blurb: string;
  chaptersEn: string;
  deckCount: number;
  /** Decks students can open now (fewer than deckCount for a book released with the class). */
  openCount: number;
  releasedWithClass: boolean;
  cardCount: number;
}

/** Search and subject filters only appear once the shelf is long enough to need them. */
export const SHELF_FILTER_FROM = 7;

/** Folds case, English diacritics (ʿ, ā, ẓ…) and Arabic vowels, so "tazim" finds "Taʿẓīm" and "تعظيم" finds "تَعْظِيمُ". */
function searchKey(text: string): string {
  return normalizeArabicForSearch(text.normalize("NFD").replace(/[̀-ͯʿʾ'’ʿʾ]/g, "").toLowerCase());
}

export default function FlashcardShelf({ books }: { books: FlashcardBookSummary[] }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const showFilters = books.length >= SHELF_FILTER_FROM;
  const subjects = [...new Set(books.map((b) => b.subject))].sort();

  const q = searchKey(query.trim());
  const shown = books.filter(
    (b) => (!subject || b.subject === subject) && (!q || [b.titleEn, b.titleAr, b.authorEn, b.subject].some((field) => searchKey(field).includes(q))),
  );

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books by title or author — English or Arabic"
            aria-label="Search books"
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          />
          <div role="group" aria-label="Subject" className="flex flex-wrap gap-2">
            {[null, ...subjects].map((s) => (
              <button
                key={s ?? "all"}
                type="button"
                aria-pressed={subject === s}
                onClick={() => setSubject(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  subject === s ? "border-emerald-700 bg-emerald-700 text-white" : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {s ?? "All subjects"}
              </button>
            ))}
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-sm text-muted">No books match your search.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shown.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/library/flashcards/${b.slug}`}
                className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md dark:hover:border-sky-700"
              >
                <span aria-hidden className="flex h-16 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-700 to-teal-800 text-amber-200 shadow-md ring-1 ring-amber-300/40 transition group-hover:scale-105">
                  <CardsIcon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span dir="rtl" lang="ar" className="block font-arabic text-xl leading-loose text-emerald-900 dark:text-amber-200">
                    {b.titleAr}
                  </span>
                  <span className="block text-sm font-semibold">{b.shortTitle} flashcards</span>
                  <span className="block text-xs text-muted">{b.authorEn}</span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {b.releasedWithClass ? `${b.openCount} of ${b.deckCount} ${b.chaptersEn} open — more after each class` : `${b.deckCount} ${b.chaptersEn}`} · {b.cardCount}{" "}
                    cards · {b.subject}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
