"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, PlayIcon } from "@/components";
import { errorMessage, fetcher, STORIES } from "@/constants";
import { listenArabic, playSequence, sentenceAround, speakArabic, speechChunks, stopAudio, storyWordKey, tokenizeParagraph } from "@/helpers";
import type { Story } from "@/types";
import StoryQuiz from "./components/StoryQuiz";
import WordPopup, { type SelectedWord } from "./components/WordPopup";

/** Per-device preference: open words straight on their meaning. */
const SKIP_NUDGE_KEY = "daaru.stories.skipNudge";

function readSkipNudge(): boolean {
  try {
    return localStorage.getItem(SKIP_NUDGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSkipNudge(skip: boolean) {
  try {
    if (skip) localStorage.setItem(SKIP_NUDGE_KEY, "1");
    else localStorage.removeItem(SKIP_NUDGE_KEY);
  } catch {
    // Storage blocked (private mode) — the choice just won't be remembered.
  }
}

const speechUrl = (text: string) => `/api/speech?text=${encodeURIComponent(text.normalize("NFC"))}`;

export default function StoryWrapper({ story, knownWordKeys }: { story: Story; knownWordKeys: string[] }) {
  const glossary = useMemo(() => new Map(Object.entries(story.glossary).map(([word, gloss]) => [storyWordKey(word), gloss])), [story]);
  const paragraphs = useMemo(() => story.paragraphs.map(tokenizeParagraph), [story]);
  const wordCount = useMemo(() => paragraphs.flat().filter((t) => t.kind === "word").length, [paragraphs]);
  const inBank = useMemo(() => new Set(knownWordKeys), [knownWordKeys]);

  const [selected, setSelected] = useState<(SelectedWord & { startRevealed: boolean }) | null>(null);
  const [skipNudge, setSkipNudge] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [figured, setFigured] = useState<Set<string>>(() => new Set());
  const [added, setAdded] = useState<Set<string>>(() => new Set());
  const [playing, setPlaying] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [listenError, setListenError] = useState<string | null>(null);

  const next = STORIES[(STORIES.findIndex((s) => s.slug === story.slug) + 1) % STORIES.length];

  function open(word: string, key: string, paragraph: number, wordIndex: number) {
    const skip = readSkipNudge();
    setSkipNudge(skip);
    setListenError(null);
    const startRevealed = skip || revealed.has(key);
    if (startRevealed) setRevealed((r) => new Set(r).add(key));
    setSelected({ word, key, gloss: glossary.get(key), sentence: sentenceAround(story.paragraphs[paragraph], wordIndex), startRevealed });
  }

  const close = useCallback(() => setSelected(null), []);
  const markRevealed = useCallback(() => {
    if (selected) setRevealed((r) => new Set(r).add(selected.key));
  }, [selected]);
  const markFigured = useCallback(() => {
    if (selected) setFigured((f) => new Set(f).add(selected.key));
  }, [selected]);

  function changeSkipNudge(skip: boolean) {
    setSkipNudge(skip);
    writeSkipNudge(skip);
  }

  async function addToVocabulary() {
    if (!selected?.gloss) return;
    const { word, key, gloss, sentence } = selected;
    await fetcher("/api/vocabulary", {
      method: "POST",
      // The word as it appears, so the card's meaning ("(she) drinks") matches it; the sentence is the example.
      json: { items: [{ wordAr: word, meaningEn: gloss.meaning, ...(gloss.root ? { root: gloss.root } : {}), exampleAr: sentence }] },
    }).catch((e: unknown) => {
      throw new Error(errorMessage(e, "Couldn't add the word."));
    });
    setAdded((a) => new Set(a).add(key));
  }

  function listenWord() {
    if (!selected) return;
    setListenError(null);
    listenArabic(selected.word).then((r) => !r.ok && setListenError(r.message ?? "Couldn't play it."));
  }

  function listenParagraph(index: number) {
    if (playing === index) {
      stopAudio();
      return;
    }
    setAudioError(null);
    const chunks = speechChunks(story.paragraphs[index]);
    playSequence(chunks.map(speechUrl), (step) => setPlaying((p) => (step === null ? (p === index ? null : p) : index))).catch(async () => {
      // The app's own audio failed (offline, quota) — try the device's Arabic voice.
      const spoken = await speakArabic(chunks.join(" "));
      if (!spoken.spoke) setAudioError("Couldn't play the reading right now — check your connection, or try again in a little while.");
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/stories" className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-300">
          <ChevronLeftIcon className="h-4 w-4" /> All stories
        </Link>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
          Level {story.level} · {wordCount} words
        </span>
      </div>

      <header className="text-center">
        <div aria-hidden className="mb-2 text-6xl">
          {story.emoji}
        </div>
        <h1 dir="rtl" className="font-arabic text-4xl leading-[1.8] text-emerald-900 dark:text-amber-200 sm:text-5xl">
          {story.titleAr}
        </h1>
        <p className="text-sm text-muted">{story.titleEn}</p>
      </header>

      <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        Tap any word you don&apos;t know — but think for a moment first. Tap ▶ to hear a part read aloud.
      </p>

      <article className="space-y-5 rounded-3xl border border-amber-200/70 bg-parchment-100 p-5 shadow-sm dark:border-amber-900/40 dark:bg-parchment-900 sm:p-8">
        {paragraphs.map((tokens, pi) => {
          let inParagraph = 0;
          return (
            <div key={pi} className="flex items-start gap-3">
              <p dir="rtl" className={`flex-1 font-arabic text-[1.75rem] leading-[2.3] sm:text-[2rem] ${playing === pi ? "rounded-xl bg-amber-100/70 dark:bg-amber-900/20" : ""}`}>
                {tokens.map((t, ti) => {
                  if (t.kind === "text") return <span key={ti}>{t.text}</span>;
                  const index = inParagraph++;
                  const state = figured.has(t.key)
                    ? "decoration-emerald-500 underline decoration-2 underline-offset-[10px]"
                    : revealed.has(t.key)
                      ? "decoration-amber-500 underline decoration-dotted decoration-2 underline-offset-[10px]"
                      : "";
                  return (
                    <button
                      key={ti}
                      type="button"
                      onClick={() => open(t.text, t.key, pi, index)}
                      className={`rounded-lg px-0.5 transition hover:bg-amber-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:hover:bg-amber-800/40 ${state}`}
                    >
                      {t.text}
                    </button>
                  );
                })}
              </p>
              <button
                type="button"
                onClick={() => listenParagraph(pi)}
                aria-label={playing === pi ? "Stop" : "Listen to this part"}
                className="mt-3 shrink-0 rounded-full border border-emerald-600/40 p-2 text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              >
                {playing === pi ? <span className="block h-3.5 w-3.5 rounded-sm bg-current" /> : <PlayIcon className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        })}
        {audioError && <p className="text-sm text-rose-600">{audioError}</p>}
      </article>

      <section aria-label="Your reading" className="grid grid-cols-3 gap-3 text-center">
        <Stat value={wordCount} label="words read" />
        <Stat value={figured.size} label="worked out yourself 🎉" />
        <Stat value={revealed.size} label="meanings looked up" />
      </section>
      <p className="-mt-4 text-center text-xs text-muted">
        <span className="underline decoration-emerald-500 decoration-2 underline-offset-4">Green</span>: you worked it out ·{" "}
        <span className="underline decoration-amber-500 decoration-dotted decoration-2 underline-offset-4">dotted</span>: you looked it up
      </p>

      {story.moral && (
        <div className="rounded-2xl border border-emerald-700/30 bg-gradient-to-r from-emerald-900 to-teal-900 p-5 text-center text-white shadow">
          <p dir="rtl" className="font-arabic text-2xl leading-loose text-amber-200">
            {story.moral.ar}
          </p>
          <p className="text-sm text-emerald-100">{story.moral.en}</p>
        </div>
      )}

      <StoryQuiz questions={story.questions} />

      {next && next.slug !== story.slug && (
        <Link
          href={`/stories/${next.slug}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-amber-400 hover:shadow-md"
        >
          <span className="text-sm text-muted">Next story</span>
          <span className="flex items-center gap-2">
            <span dir="rtl" className="font-arabic text-xl">
              {next.emoji} {next.titleAr}
            </span>
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </Link>
      )}

      {selected && (
        <WordPopup
          key={selected.key}
          selected={selected}
          startRevealed={selected.startRevealed}
          skipNudge={skipNudge}
          onSkipNudgeChange={changeSkipNudge}
          inBank={inBank.has(selected.key)}
          added={added.has(selected.key)}
          onAdd={addToVocabulary}
          onListen={listenWord}
          listenError={listenError}
          onReveal={markRevealed}
          onFigured={markFigured}
          onClose={close}
        />
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-2 py-3">
      <p className="text-2xl font-bold text-emerald-800 dark:text-amber-200">{value}</p>
      <p className="text-[11px] leading-tight text-muted">{label}</p>
    </div>
  );
}
