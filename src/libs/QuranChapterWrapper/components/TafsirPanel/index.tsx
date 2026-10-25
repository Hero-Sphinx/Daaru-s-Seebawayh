"use client";

import { withQuranBrackets } from "@/helpers";
import type { LanguageChoice } from "@/hooks";
import type { QuranTafsirDTO } from "@/types";

export type TafsirState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; tafsir: QuranTafsirDTO };

const LANGUAGES: { value: LanguageChoice; label: string }[] = [
  { value: "both", label: "Both" },
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

/** Where the tafsīr comes from — shown under every panel, as QuranEnc asks. */
export const TAFSIR_ATTRIBUTION =
  "Arabic: at-Tafsīr al-Muyassar (King Fahd Complex). English: al-Mukhtaṣar fī Tafsīr al-Qurʾān (Tafsir Center for Quranic Studies). Both via QuranEnc.com.";

/** The brief tafsīr of one āyah, under it in the reader. */
export default function TafsirPanel({
  state,
  language,
  onLanguage,
}: {
  state: TafsirState;
  language: LanguageChoice;
  onLanguage: (choice: LanguageChoice) => void;
}) {
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-emerald-600/20 bg-white/70 p-3.5 dark:border-emerald-400/20 dark:bg-parchment-800/70">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800/80 dark:text-emerald-300/80">
          Tafsīr · <bdi className="font-arabic normal-case tracking-normal">تَفْسِيرٌ مُيَسَّرٌ</bdi>
        </p>
        <div role="group" aria-label="Tafsīr language" className="flex gap-1 text-xs">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => onLanguage(l.value)}
              aria-pressed={language === l.value}
              className={`rounded-full px-2.5 py-0.5 transition ${
                language === l.value
                  ? "bg-emerald-700 text-white"
                  : "border border-border text-stone-600 hover:bg-emerald-50 dark:text-stone-300 dark:hover:bg-emerald-900/30"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {state.status === "loading" && <p className="text-sm text-stone-500">Loading the tafsīr…</p>}
      {state.status === "error" && <p className="text-sm text-rose-600">{state.message}</p>}
      {state.status === "ready" && (
        <>
          {language !== "en" && (
            <p dir="rtl" lang="ar" className="font-arabic text-lg leading-loose text-stone-800 dark:text-stone-100">
              {withQuranBrackets(state.tafsir.muyassarAr)}
            </p>
          )}
          {language !== "ar" && <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{state.tafsir.mukhtasarEn}</p>}
          <p className="border-t border-stone-200 pt-2 text-[11px] leading-snug text-stone-500 dark:border-stone-700 dark:text-stone-400">
            {TAFSIR_ATTRIBUTION}
          </p>
        </>
      )}
    </div>
  );
}
