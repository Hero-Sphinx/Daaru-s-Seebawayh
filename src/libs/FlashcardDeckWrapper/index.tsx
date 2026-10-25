"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowRightIcon, ChevronLeftIcon, LockIcon, ShieldIcon } from "@/components";
import { answerCard, firstTryCount, isSessionDone, shuffledIndices, startSession } from "@/helpers";
import { useKeyboardShortcuts } from "@/hooks";
import type { BilingualText, FlashcardBook, FlashcardKind, FlashcardSection } from "@/types";
import { type CardLanguage, FlashcardFace } from "./components";

const KIND_LABEL: Record<FlashcardKind, string> = {
  principle: "The principle",
  term: "Key term",
  point: "Main point",
  list: "List",
  example: "Likeness",
  cloze: "Fill in the blank",
  evidence: "Evidence",
  hadith: "Ḥadīth",
  quote: "Saying",
  story: "From their lives",
  poetry: "Poetry · complete the line",
};

const LANGUAGES: { value: CardLanguage; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

// Per-device preference: which language the cards show. Kept in localStorage
// (a convenience, not data), read through useSyncExternalStore so the server
// render and the first client render agree on "both".
const LANGUAGE_KEY = "daaru.flashcards.language";
const languageListeners = new Set<() => void>();

function readLanguage(): CardLanguage {
  try {
    const v = localStorage.getItem(LANGUAGE_KEY);
    return v === "ar" || v === "en" ? v : "both";
  } catch {
    return "both";
  }
}

function writeLanguage(language: CardLanguage) {
  try {
    if (language === "both") localStorage.removeItem(LANGUAGE_KEY);
    else localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage blocked (private mode) — the choice just won't be remembered.
  }
  languageListeners.forEach((l) => l());
}

function subscribeLanguage(listener: () => void) {
  languageListeners.add(listener);
  return () => languageListeners.delete(listener);
}

const inBookOrder = (count: number) => Array.from({ length: count }, (_, i) => i);

/** Just what the deck page needs of its book — never the other chapters' cards (some may still be locked). */
export type FlashcardDeckBook = Pick<FlashcardBook, "slug" | "shortTitle" | "chapters" | "source">;

/**
 * - "open": a normal practice round.
 * - "preview": an admin looking at a deck students can't see yet.
 * - "locked": not taught yet — a notice instead of the cards (the page sends none).
 */
export type DeckAccess = "open" | "preview" | "locked";

export default function FlashcardDeckWrapper({
  book,
  section,
  next,
  access = "open",
}: {
  book: FlashcardDeckBook;
  section: FlashcardSection;
  /** The following chapter, when the learner may open it. */
  next?: { number: number; label: BilingualText };
  access?: DeckAccess;
}) {
  const language = useSyncExternalStore(subscribeLanguage, readLanguage, () => "both" as const);
  const [session, setSession] = useState(() => startSession(inBookOrder(section.cards.length)));
  const [flipped, setFlipped] = useState(false);

  const done = isSessionDone(session);
  const card = done ? undefined : section.cards[session.queue[0]];
  const deckUrl = (n: number) => `/library/flashcards/${book.slug}/${n}`;

  function restart(cards: number[]) {
    setSession(startSession(cards));
    setFlipped(false);
  }

  function answer(knewIt: boolean) {
    setSession((s) => answerCard(s, knewIt));
    setFlipped(false);
  }

  // Space / Enter shows the answer; then 1 = Again, 2 = Got it.
  useKeyboardShortcuts(
    {
      " ": () => setFlipped(true),
      Enter: () => setFlipped(true),
      "1": () => flipped && answer(false),
      "2": () => flipped && answer(true),
    },
    !done && access !== "locked",
  );

  const header = (
    <header className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
        {book.shortTitle} · {section.label.en}
      </p>
      <h1 dir="rtl" lang="ar" className="mt-1 font-arabic text-3xl leading-[1.9] text-emerald-900 dark:text-amber-200 sm:text-4xl">
        {section.title.ar}
      </h1>
      <p className="text-sm text-muted">{section.title.en}</p>
    </header>
  );
  const backLink = (
    <Link href={`/library/flashcards/${book.slug}`} className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline dark:text-sky-300">
      <ChevronLeftIcon className="h-4 w-4" /> {book.shortTitle} · all {book.chapters.en}
    </Link>
  );

  if (access === "locked") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        {backLink}
        {header}
        <div className="space-y-2 rounded-3xl border border-dashed border-amber-400/70 bg-amber-50 p-6 text-center dark:bg-amber-950/20">
          <LockIcon className="mx-auto h-8 w-8 text-amber-600" />
          <p className="font-semibold">This deck opens after it&apos;s taught in class.</p>
          <p className="text-sm text-muted">Once the class has covered this {book.chapters.en.replace(/s$/, "")}, its flashcards will appear here, in shāʾ Allāh.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {backLink}
        <div role="group" aria-label="Card language" className="flex rounded-xl border border-border bg-surface p-0.5 text-xs font-medium">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              aria-pressed={language === l.value}
              onClick={() => writeLanguage(l.value)}
              className={`rounded-lg px-3 py-1.5 transition ${l.value === "ar" ? "font-arabic text-sm" : ""} ${
                language === l.value ? "bg-emerald-700 text-white shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {access === "preview" && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldIcon className="h-4 w-4 shrink-0" />
          <span>
            Admin preview — students can&apos;t see this deck yet.{" "}
            <Link href="/admin" className="font-semibold underline">
              Unlock it
            </Link>
          </span>
        </p>
      )}

      {header}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {session.learnt} of {session.total} learnt
          </span>
          {!done && (
            <button type="button" onClick={() => restart(shuffledIndices(section.cards.length))} className="font-medium text-sky-700 hover:underline dark:text-sky-300">
              Shuffle &amp; restart
            </button>
          )}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60" role="progressbar" aria-valuemin={0} aria-valuemax={session.total} aria-valuenow={session.learnt}>
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-400 transition-all duration-500" style={{ width: `${(session.learnt / Math.max(session.total, 1)) * 100}%` }} />
        </div>
      </div>

      {card ? (
        <section aria-label="Flashcard" className="space-y-4">
          {/* Before the answer shows, the whole card is a tap target (a div, since a button can't hold the card's paragraphs). */}
          <div
            {...(flipped
              ? {}
              : {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": "Show the answer",
                  onClick: () => setFlipped(true),
                })}
            className={`rounded-3xl border border-amber-200/70 bg-parchment-100 p-5 shadow-sm dark:border-amber-900/40 dark:bg-parchment-900 sm:p-8 ${
              flipped ? "" : "cursor-pointer transition hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3 text-xs">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">{KIND_LABEL[card.kind]}</span>
              <span className="text-muted">p. {card.page}</span>
            </div>

            {flipped ? (
              <div className="space-y-5">
                <div className="opacity-70">
                  <FlashcardFace text={card.front} language={language} size="sm" />
                </div>
                <hr className="border-amber-300/60 dark:border-amber-800/50" />
                <FlashcardFace text={card.back} language={language} />
                {card.note && (
                  <div className="rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                    <FlashcardFace text={card.note} language={language} size="sm" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <FlashcardFace text={card.front} language={language} />
                <p className="mt-6 text-center text-xs text-muted">Think of the answer first, then tap the card.</p>
              </>
            )}
          </div>

          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900"
              >
                Again <span className="font-arabic font-normal">· أَعِدْ</span>
              </button>
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Got it <span className="font-arabic font-normal">· عَرَفْتُهُ</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="w-full rounded-2xl border-2 border-emerald-600 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              Show answer
            </button>
          )}
          <p className="hidden text-center text-xs text-muted sm:block">Keys: Space to show · 1 Again · 2 Got it</p>
        </section>
      ) : (
        <section aria-label="Round complete" className="space-y-4 rounded-3xl border border-emerald-700/30 bg-gradient-to-br from-emerald-900 to-teal-900 p-6 text-center text-white shadow">
          <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose text-amber-200">
            بَارَكَ اللهُ فِيكَ!
          </p>
          <p className="text-lg font-semibold">
            You&apos;ve learnt all {session.total} cards of {section.label.en.replace("The ", "the ")}.
          </p>
          <p className="text-sm text-emerald-100">
            {firstTryCount(session) === session.total
              ? "Every one right the first time 🌟"
              : `${firstTryCount(session)} right the first time · ${session.missed.length} needed another go.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {session.missed.length > 0 && (
              <button type="button" onClick={() => restart(session.missed)} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-amber-300">
                Practise the {session.missed.length} I missed
              </button>
            )}
            <button type="button" onClick={() => restart(shuffledIndices(section.cards.length))} className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">
              Practise all again (shuffled)
            </button>
            {next && (
              <Link href={deckUrl(next.number)} className="flex items-center gap-1 rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10">
                {next.label.en} <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      )}

      <p className="text-center text-xs text-muted">
        {book.source.english === "edition" ? "From the bilingual edition by" : "Arabic from"}{" "}
        <a href={book.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-700 dark:hover:text-sky-300">
          {book.source.name}
        </a>
        {book.source.english === "edition" ? "." : "; English translation ours."}
      </p>
    </div>
  );
}
