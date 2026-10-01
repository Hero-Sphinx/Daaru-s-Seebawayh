"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, LightbulbIcon, VolumeIcon, XIcon } from "@/components";
import type { StoryGloss } from "@/types";

export interface SelectedWord {
  word: string;
  key: string;
  gloss: StoryGloss | undefined;
  sentence: string;
}

type Step = "nudge" | "hint" | "reveal";

/** Gentle pushes to think first — picked per word so the same word always says the same thing. */
const NUDGES = [
  "Are you sure? Read the sentence once more — we often know more than we think we know 😉",
  "Wait a moment! Give it one more try… your brain might surprise you 🧠",
  "Hmm, think hard for a second — what would make sense here? 🤔",
  "Before you peek… look at the words around it. Any clues? 🔍",
];

function nudgeFor(key: string): string {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return NUDGES[h % NUDGES.length];
}

interface Props {
  selected: SelectedWord;
  /** Open on the meaning: the learner switched the nudge off, or has already seen this one. */
  startRevealed: boolean;
  skipNudge: boolean;
  onSkipNudgeChange: (skip: boolean) => void;
  inBank: boolean;
  added: boolean;
  onAdd: () => Promise<void>;
  onListen: () => void;
  listenError: string | null;
  onReveal: () => void;
  onFigured: () => void;
  onClose: () => void;
}

/**
 * The word pop-up: on phones a sheet from the bottom, on larger screens a
 * card in the middle. It asks the reader to think before it tells — retrieval
 * practice — then offers a hint (root + a related clue), then the meaning.
 */
export default function WordPopup(props: Props) {
  const { selected, startRevealed, skipNudge, onSkipNudgeChange, inBank, added, onAdd, onListen, listenError, onReveal, onFigured, onClose } = props;
  const gloss = selected.gloss;
  const hasHint = Boolean(gloss?.hint || gloss?.root);
  const [step, setStep] = useState<Step>(startRevealed || !gloss ? "reveal" : "nudge");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function add() {
    setAdding(true);
    setAddError(null);
    try {
      await onAdd();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Couldn't add the word.");
    } finally {
      setAdding(false);
    }
  }

  // Seeing the meaning counts as a look-up (opening straight onto it is counted by the reader).
  function reveal() {
    setStep("reveal");
    onReveal();
  }

  function gotIt() {
    onFigured();
    onClose();
  }

  const secondary =
    "rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";
  const primary =
    "rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-word"
        className="relative w-full max-w-md rounded-t-3xl border border-border bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-3xl"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-surface hover:text-foreground">
          <XIcon className="h-5 w-5" />
        </button>

        <p id="story-word" dir="rtl" className="mb-3 pr-1 text-center font-arabic text-5xl leading-[1.9] text-emerald-900 dark:text-amber-200">
          {selected.word}
        </p>

        {step === "nudge" && (
          <div className="space-y-4 text-center">
            <p className="text-base leading-relaxed">{nudgeFor(selected.key)}</p>
            <p dir="rtl" className="rounded-xl bg-amber-50 px-3 py-2 font-arabic text-lg leading-loose text-stone-700 dark:bg-amber-950/30 dark:text-stone-200">
              {selected.sentence}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button ref={primaryRef} type="button" onClick={gotIt} className={primary}>
                I&apos;ve got it! 🎉
              </button>
              {hasHint && (
                <button type="button" onClick={() => setStep("hint")} className={`${secondary} flex items-center gap-1.5`}>
                  <LightbulbIcon className="h-4 w-4" /> Give me a hint
                </button>
              )}
              <button type="button" onClick={reveal} className={secondary}>
                Show me
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={skipNudge} onChange={(e) => onSkipNudgeChange(e.target.checked)} className="accent-emerald-700" />
              Don&apos;t ask me first — show meanings straight away
            </label>
          </div>
        )}

        {step === "hint" && gloss && (
          <div className="space-y-4 text-center">
            <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
              <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                <LightbulbIcon className="h-4 w-4" /> Hint
              </p>
              {gloss.hint && <p className="text-base leading-relaxed">{gloss.hint}</p>}
              {gloss.root && (
                <p className="mt-2 text-sm text-muted">
                  Root: <bdi className="font-arabic text-lg text-foreground">{gloss.root}</bdi>
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button ref={primaryRef} type="button" onClick={gotIt} className={primary}>
                Got it! 🎉
              </button>
              <button type="button" onClick={reveal} className={secondary}>
                Show me
              </button>
            </div>
          </div>
        )}

        {step === "reveal" && (
          <div className="space-y-4">
            {gloss ? (
              <div className="rounded-2xl border border-emerald-600/25 bg-emerald-50/80 p-4 text-center dark:border-emerald-400/20 dark:bg-emerald-950/40">
                <p className="text-xl font-semibold text-emerald-950 dark:text-emerald-100">{gloss.meaning}</p>
                {(gloss.lemma || gloss.root) && (
                  <p className="mt-1.5 text-sm text-muted">
                    {gloss.lemma && (
                      <>
                        Dictionary form <bdi className="font-arabic text-lg text-foreground">{gloss.lemma}</bdi>
                      </>
                    )}
                    {gloss.lemma && gloss.root && " · "}
                    {gloss.root && (
                      <>
                        root <bdi className="font-arabic text-lg text-foreground">{gloss.root}</bdi>
                      </>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted">We don&apos;t have a meaning for this word yet.</p>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <button ref={primaryRef} type="button" onClick={onListen} className={`${secondary} flex items-center gap-1.5`}>
                <VolumeIcon className="h-4 w-4" /> Listen
              </button>
              {gloss &&
                (inBank || added ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                    <CheckIcon className="h-4 w-4" /> {added ? "Added to your vocabulary" : "Already in your vocabulary"}
                  </span>
                ) : (
                  <button type="button" onClick={add} disabled={adding} className={`${primary} disabled:opacity-60`}>
                    {adding ? "Adding…" : "+ Add to my vocabulary"}
                  </button>
                ))}
            </div>
            {listenError && <p className="text-center text-xs text-rose-600">{listenError}</p>}
            {addError && <p className="text-center text-xs text-rose-600">{addError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
