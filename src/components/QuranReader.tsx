"use client";

import { useCallback, useRef, useState } from "react";
import MobileSheet from "@/components/MobileSheet";
import { PlayIcon, VolumeIcon } from "@/components/icons";
import { playClip, playSequence, stopAudio } from "@/lib/audio-player";
import { QURAN_AUDIO_ATTRIBUTION, wordAudioUrl } from "@/lib/quran/audio";
import { describeWord, wordTone } from "@/lib/quran/labels";
import type { QuranVerseDTO, QuranWordDTO, RootFamilyDTO } from "@/lib/quran/types";

const TONE_CLASS: Record<ReturnType<typeof wordTone>, string> = {
  nominative: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  accusative: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  genitive: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  verb: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  other: "text-stone-700 dark:text-stone-300",
};

const LEGEND: { tone: ReturnType<typeof wordTone>; label: string }[] = [
  { tone: "nominative", label: "Marfūʿ (nominative)" },
  { tone: "accusative", label: "Manṣūb (accusative)" },
  { tone: "genitive", label: "Majrūr (genitive)" },
  { tone: "verb", label: "Verb" },
  { tone: "other", label: "Particle / indeclinable" },
];

type RootState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; family: RootFamilyDTO };

export default function QuranReader({ chapterId, verses }: { chapterId: number; verses: QuranVerseDTO[] }) {
  const [selected, setSelected] = useState<{ verse: number; word: QuranWordDTO } | null>(null);
  const [roots, setRoots] = useState<Record<string, RootState>>({});
  const inFlight = useRef(new Set<string>());
  const [playing, setPlaying] = useState<{ verse: number; index: number } | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const closeWord = useCallback(() => setSelected(null), []);

  function playVerse(v: QuranVerseDTO) {
    if (playing?.verse === v.number) {
      stopAudio();
      return;
    }
    setAudioError(null);
    playSequence(
      v.words.map((w) => wordAudioUrl(chapterId, v.number, w.position)),
      // A null from a sequence that's since been replaced must not clear the new one's highlight.
      (index) => setPlaying((p) => (index === null ? (p?.verse === v.number ? null : p) : { verse: v.number, index }))
    ).catch((e: unknown) => setAudioError(e instanceof Error ? e.message : "Audio failed"));
  }

  // Fetched from the click handler (not an effect): the request is a direct
  // consequence of the user's action, and results are cached per root.
  function select(verse: number, word: QuranWordDTO) {
    setSelected({ verse, word });
    const rootId = word.root?.id;
    if (!rootId || roots[rootId] || inFlight.current.has(rootId)) return;
    inFlight.current.add(rootId);
    setRoots((r) => ({ ...r, [rootId]: { status: "loading" } }));
    fetch(`/api/quran/roots/${rootId}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Failed to load root");
        setRoots((r) => ({ ...r, [rootId]: { status: "ready", family: body as RootFamilyDTO } }));
      })
      .catch((e: unknown) => setRoots((r) => ({ ...r, [rootId]: { status: "error", message: e instanceof Error ? e.message : "Failed" } })))
      .finally(() => inFlight.current.delete(rootId));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        {audioError && <p className="text-sm text-rose-600">{audioError}</p>}
        <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-900 dark:bg-teal-950/40 dark:text-teal-200 lg:hidden">
          Tap any word to see its root, form and grammar, and to hear it recited.
        </p>
        <ul className="flex flex-wrap gap-2 text-xs">
          {LEGEND.map(({ tone, label }) => (
            <li key={tone} className={`rounded-md px-2 py-1 ${TONE_CLASS[tone]} ${tone === "other" ? "border border-border" : ""}`}>
              {label}
            </li>
          ))}
        </ul>

        <ol className="space-y-3">
          {verses.map((v) => (
            <li
              key={v.number}
              className="rounded-lg border border-amber-200/60 bg-parchment-100 p-4 dark:border-amber-900/40 dark:bg-parchment-900"
            >
              <div dir="rtl" className="arabic-display flex flex-wrap items-baseline gap-x-1.5 gap-y-2 font-arabic leading-loose">
                {v.words.map((w, wi) => {
                  const isSelected = selected?.verse === v.number && selected.word.id === w.id;
                  const isPlaying = playing?.verse === v.number && playing.index === wi;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => select(v.number, w)}
                      aria-pressed={isSelected}
                      className={`rounded-md px-1 transition hover:ring-2 hover:ring-teal-400 ${TONE_CLASS[wordTone(w)]} ${
                        isSelected ? "ring-2 ring-teal-600" : ""
                      } ${isPlaying ? "underline decoration-teal-600 decoration-4 underline-offset-8" : ""}`}
                    >
                      {w.surface}
                    </button>
                  );
                })}
                <span className="mx-1 text-base text-emerald-800 dark:text-amber-300" aria-label={`Verse ${v.number}`}>
                  ﴿{v.number.toLocaleString("ar-EG")}﴾
                </span>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => playVerse(v)}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                >
                  <PlayIcon className="h-3 w-3" /> {playing?.verse === v.number ? "Stop" : "Recite word by word"}
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Sticky on wide screens, but capped to the viewport and scrollable on
          its own — a sticky panel taller than the window can never reveal its bottom. */}
      <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-4">
        {/* On phones this slides up from the bottom when a word is tapped; on large screens it's the side column. */}
        <MobileSheet open={selected !== null} onClose={closeWord} title="Word details">
          {selected ? (
            <WordCard chapterId={chapterId} verse={selected.verse} word={selected.word} root={selected.word.root ? roots[selected.word.root.id] : undefined} />
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 p-6 text-sm text-stone-500 dark:border-stone-600 dark:text-stone-400">
              Tap any word to see its root, lemma, part of speech, case or mood, and how it breaks into prefix / stem / suffix.
            </div>
          )}
        </MobileSheet>
      </aside>
    </div>
  );
}

function WordCard({ chapterId, verse, word, root }: { chapterId: number; verse: number; word: QuranWordDTO; root: RootState | undefined }) {
  const features = describeWord(word);
  const [audioError, setAudioError] = useState<string | null>(null);

  function listen() {
    setAudioError(null);
    playClip(wordAudioUrl(chapterId, verse, word.position)).catch((e: unknown) =>
      setAudioError(e instanceof Error ? e.message : "Audio failed")
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700/60 dark:bg-parchment-800">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-stone-500">
          {chapterId}:{verse}:{word.position}
        </p>
        <p dir="rtl" className="min-w-0 break-words text-right font-arabic text-4xl leading-[1.8] text-emerald-900 dark:text-amber-200">
          {word.surface}
        </p>
      </div>

      <button
        type="button"
        onClick={listen}
        className="flex items-center gap-1.5 rounded-full border border-emerald-600/40 px-3 py-1 text-xs text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
      >
        <VolumeIcon className="h-3.5 w-3.5" /> Listen (recitation)
      </button>
      {audioError && <p className="text-xs text-rose-600">{audioError}</p>}

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-2 text-sm">
        {word.pos && (
          <>
            <dt className="whitespace-nowrap text-stone-500">Part of speech</dt>
            <dd className="leading-relaxed">
              {word.pos.nameEn} · <bdi className="font-arabic">{word.pos.nameAr}</bdi>
            </dd>
          </>
        )}
        {word.lemma && (
          <>
            <dt className="whitespace-nowrap text-stone-500">Lemma</dt>
            <dd dir="rtl" className="break-words text-right font-arabic text-xl leading-loose">
              {word.lemma.ar}
            </dd>
          </>
        )}
        {word.root && (
          <>
            <dt className="whitespace-nowrap text-stone-500">Root</dt>
            <dd dir="rtl" className="text-right font-arabic text-xl leading-loose">
              {word.root.letters}
            </dd>
          </>
        )}
        {features.map((f) => (
          <FeatureRow key={f.label} label={f.label} en={f.en} ar={f.ar} />
        ))}
      </dl>

      {word.segments.length > 1 && (
        <div>
          <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">Segments</h3>
          <ol dir="rtl" className="flex flex-wrap gap-1.5">
            {word.segments.map((s, i) => (
              <li
                key={i}
                title={s.features}
                className={`rounded-lg border px-2.5 py-1.5 text-center ${
                  s.type === "stem" ? "border-teal-500 bg-teal-50 dark:bg-teal-950" : "border-border"
                }`}
              >
                <span className="block font-arabic text-xl leading-loose">{s.surface}</span>
                <span dir="ltr" className="block text-[10px] text-stone-500">
                  {s.type} · {s.pos?.nameEn ?? "—"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {word.root && <RootFamily state={root} currentLemmaId={word.lemma?.id ?? null} />}

      <p className="border-t border-stone-200 pt-3 text-[11px] leading-snug text-stone-500 dark:border-stone-700 dark:text-stone-400">
        Source: Quranic Arabic Corpus morphology (verified annotation). {QURAN_AUDIO_ATTRIBUTION}. The corpus marks case and mood but not the
        syntactic role (fāʿil, mafʿūl bihi…) in bulk data, so roles aren&apos;t shown rather than guessed.
      </p>
    </div>
  );
}

function FeatureRow({ label, en, ar }: { label: string; en: string; ar: string }) {
  return (
    <>
      <dt className="whitespace-nowrap text-stone-500">{label}</dt>
      <dd className="leading-relaxed">
        {en} · <bdi className="font-arabic">{ar}</bdi>
      </dd>
    </>
  );
}

/** Words shown before "Show all" — the most frequent, plus the tapped word's own lemma. */
const ROOT_FAMILY_PREVIEW = 8;

function RootFamily({ state, currentLemmaId }: { state: RootState | undefined; currentLemmaId: string | null }) {
  const [showAll, setShowAll] = useState(false);
  if (!state || state.status === "loading") return <p className="text-xs text-stone-500">Loading words from this root…</p>;
  if (state.status === "error") return <p className="text-xs text-red-600">{state.message}</p>;
  const { family } = state;

  // Lemmas arrive most-frequent first; keep the current word visible even if it's rare.
  const preview = family.lemmas.slice(0, ROOT_FAMILY_PREVIEW);
  const current = family.lemmas.find((l) => l.id === currentLemmaId);
  if (current && !preview.includes(current)) preview.push(current);
  const shown = showAll ? family.lemmas : preview;
  const hidden = family.lemmas.length - shown.length;

  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
        Root family · {family.lemmas.length} words · {family.occurrences} occurrences
      </h3>
      <ul className="divide-y divide-stone-100 dark:divide-stone-700/60">
        {shown.map((l) => (
          <li
            key={l.id}
            className={`flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm ${
              l.id === currentLemmaId ? "bg-teal-50 dark:bg-teal-950" : ""
            }`}
          >
            <span className="min-w-0 text-xs text-stone-500">
              {l.pos?.nameEn ?? "—"}
              {l.verbForm ? ` · Form ${ROMAN_FORMS[l.verbForm]}` : ""} · ×{l.occurrences}
            </span>
            <bdi dir="rtl" className="shrink-0 font-arabic text-xl leading-loose">
              {l.ar}
            </bdi>
          </li>
        ))}
      </ul>
      {(hidden > 0 || showAll) && family.lemmas.length > preview.length && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
        >
          {showAll ? "Show fewer" : `Show all ${family.lemmas.length} words`}
        </button>
      )}
    </div>
  );
}

const ROMAN_FORMS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
