"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VolumeIcon, XIcon } from "@/components";
import { isArabicWord, listenArabic, parseBulkVocabularyText, playClip, wordAudioUrl } from "@/helpers";
import type { MorphCandidate, VocabularyCardDTO, WordLookupResponse as LookupResponse } from "@/types";

type Mode = "single" | "bulk";

async function postVocabulary(items: { wordAr: string; meaningEn: string; root?: string; transliteration?: string; exampleAr?: string }[]) {
  const res = await fetch("/api/vocabulary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to save vocabulary");
  }
}

async function lookupVocabularyWord(input: string): Promise<LookupResponse> {
  const res = await fetch("/api/vocabulary/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  const body: LookupResponse & { error?: string } = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Auto-fill failed");
  return body;
}

export default function VocabularyManager({ items }: { items: VocabularyCardDTO[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("single");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wordAr, setWordAr] = useState("");
  const [meaningEn, setMeaningEn] = useState("");
  const [root, setRoot] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [exampleAr, setExampleAr] = useState("");
  const [bulkText, setBulkText] = useState("");

  const [enriching, setEnriching] = useState(false);
  const [enrichCandidates, setMorphCandidates] = useState<MorphCandidate[] | null>(null);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [aiFilledFields, setAiFilledFields] = useState<Set<"meaningEn" | "transliteration">>(new Set());

  const [speechError, setSpeechError] = useState<string | null>(null);

  async function handleSpeak(wordAr: string, quran?: { chapter: number; verse: number; word: number } | null) {
    setSpeechError(null);
    const result = await listenArabic(wordAr, quran);
    if (!result.ok) setSpeechError(result.message ?? "Couldn't play the pronunciation.");
  }


  /**
   * Resolves whatever the user typed — Arabic script, or a transliteration
   * guess if they don't know the script — into a spelling, meaning, and
   * transliteration (Gemini) plus root/lemma/POS (CAMeL Tools,
   * deterministic). See src/server/services/vocabulary/lookupPrompt.ts for why meaning/
   * transliteration are the one vocabulary field that uses AI.
   */
  async function handleEnrich() {
    if (!wordAr.trim() || enriching) return;
    setEnriching(true);
    setEnrichError(null);
    setMorphCandidates(null);
    try {
      const body = await lookupVocabularyWord(wordAr);
      setWordAr(body.arabicWord);
      const filled = new Set<"meaningEn" | "transliteration">();
      if (body.aiAssisted) {
        if (body.meaningEn && !meaningEn.trim()) {
          setMeaningEn(body.meaningEn);
          filled.add("meaningEn");
        }
        if (body.transliteration && !transliteration.trim()) {
          setTransliteration(body.transliteration);
          filled.add("transliteration");
        }
      }
      setAiFilledFields(filled);

      const candidates = body.camelCandidates ?? [];
      if (candidates.length === 1) {
        applyCandidate(candidates[0]);
      } else if (candidates.length > 1) {
        setMorphCandidates(candidates);
      } else if (!body.aiAssisted) {
        setEnrichError("No morphological analysis found for that word — it may be a name, loanword, or misspelling.");
      }
    } catch (err) {
      setEnrichError(err instanceof Error ? err.message : "Auto-fill failed");
    } finally {
      setEnriching(false);
    }
  }

  function applyCandidate(candidate: MorphCandidate) {
    if (candidate.root) setRoot(candidate.root);
    if (candidate.diac) setWordAr(candidate.diac);
    setMorphCandidates(null);
  }

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wordAr.trim() || !meaningEn.trim()) return;
    setBusy(true);
    setError(null);
    try {
      let finalWordAr = wordAr;
      let finalRoot = root;
      let finalTransliteration = transliteration;
      // A transliteration ("kitab") typed without ever clicking "Auto-fill"
      // must not get saved literally — resolve it to Arabic script here too,
      // not just when the button is clicked, since that's the one thing
      // this field can never correctly hold on its own.
      if (!isArabicWord(wordAr)) {
        try {
          const body = await lookupVocabularyWord(wordAr);
          finalWordAr = body.arabicWord;
          if (!finalRoot.trim() && body.camelCandidates?.[0]?.root) finalRoot = body.camelCandidates[0].root;
          if (!finalTransliteration.trim() && body.transliteration) finalTransliteration = body.transliteration;
        } catch (lookupErr) {
          throw new Error(
            lookupErr instanceof Error
              ? `Couldn't resolve "${wordAr}" to Arabic: ${lookupErr.message}`
              : `Couldn't resolve "${wordAr}" to Arabic spelling.`
          );
        }
      }
      await postVocabulary([{ wordAr: finalWordAr, meaningEn, root: finalRoot, transliteration: finalTransliteration, exampleAr }]);
      setWordAr("");
      setMeaningEn("");
      setRoot("");
      setTransliteration("");
      setExampleAr("");
      setAiFilledFields(new Set());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rows = parseBulkVocabularyText(bulkText);
    if (rows.length === 0) {
      setError("No valid rows found. Each line: arabic,meaning[,root[,transliteration[,example]]]");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await postVocabulary(rows);
      setBulkText("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setBusy(true);
    try {
      await fetch(`/api/vocabulary/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700/60 dark:bg-parchment-800">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setMode("single")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "single" ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
            }`}
          >
            Add one word
          </button>
          <button
            onClick={() => setMode("bulk")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === "bulk" ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
            }`}
          >
            Bulk / CSV import
          </button>
        </div>

        {mode === "single" ? (
          <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex gap-2 sm:col-span-2">
              <input
                value={wordAr}
                onChange={(e) => setWordAr(e.target.value)}
                placeholder={`Arabic word, or a transliteration if you don't know the spelling (e.g. "kitab") *`}
                dir="auto"
                required
                className="flex-1 rounded-md border border-stone-300 bg-stone-50 px-3 py-2 font-arabic text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900"
              />
              <button
                type="button"
                onClick={handleEnrich}
                disabled={!wordAr.trim() || enriching}
                title="Auto-fill spelling, meaning, transliteration, and root"
                className="shrink-0 rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                {enriching ? "Looking up…" : "Auto-fill"}
              </button>
            </div>

            {enrichError && <p className="text-xs text-amber-700 dark:text-amber-400 sm:col-span-2">{enrichError}</p>}
            {aiFilledFields.size > 0 && (
              <p className="text-xs text-purple-700 dark:text-purple-400 sm:col-span-2">
                Meaning/transliteration below are AI-suggested (Gemini) — root and spelling stay verified via CAMeL Tools. Check
                them before saving.
              </p>
            )}

            {enrichCandidates && enrichCandidates.length > 1 && (
              <div className="space-y-1.5 rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/30 sm:col-span-2">
                <p className="font-medium text-muted">
                  Multiple readings found for this word (undiacritized Arabic is often ambiguous) — pick one:
                </p>
                {enrichCandidates.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyCandidate(c)}
                    className="flex w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-left transition hover:border-emerald-400 dark:border-stone-700 dark:bg-parchment-900"
                  >
                    <span dir="rtl" className="font-arabic text-base">
                      {c.diac}
                    </span>
                    <span className="text-muted">
                      {c.pos} · root <span dir="rtl">{c.root}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <input
              value={meaningEn}
              onChange={(e) => setMeaningEn(e.target.value)}
              placeholder="English meaning *"
              required
              className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900"
            />
            <input
              value={root}
              onChange={(e) => setRoot(e.target.value)}
              placeholder="Root (e.g. ك ت ب)"
              dir="rtl"
              className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900"
            />
            <input
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              placeholder="Transliteration"
              className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900"
            />
            <input
              value={exampleAr}
              onChange={(e) => setExampleAr(e.target.value)}
              placeholder="Example sentence (optional)"
              dir="rtl"
              className="rounded-md border border-stone-300 bg-stone-50 px-3 py-2 font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900 sm:col-span-2"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 sm:col-span-2"
            >
              {busy ? "Saving…" : "Add word"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit} className="space-y-3">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={6}
              placeholder={"arabic,meaning,root,transliteration,example\nكِتَاب,book,ك ت ب,kitab,قَرَأْتُ الكِتَابَ"}
              className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900"
            />
            <p className="text-xs text-muted">
              One word per line: <code>arabic,meaning</code> required, root/transliteration/example optional.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {busy ? "Importing…" : "Import words"}
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700/60 dark:bg-parchment-800">
        <h3 className="mb-3 font-medium">Your vocabulary bank ({items.length})</h3>
        {speechError && (
          <p className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {speechError}{" "}
            <button onClick={() => setSpeechError(null)} className="underline">
              Dismiss
            </button>
          </p>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-muted">No words yet — add one above to get started.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 rounded-md border border-stone-200 p-3 text-sm dark:border-stone-700"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span dir="rtl" className="font-arabic text-lg">
                      {item.wordAr}
                    </span>
                    <button
                      onClick={() => handleSpeak(item.wordAr, item.quranOccurrence)}
                      aria-label={`Listen to ${item.wordAr}`}
                      className="text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
                    >
                      <VolumeIcon className="h-3.5 w-3.5" />
                    </button>
                    {item.quranOccurrence && (
                      <button
                        onClick={() => {
                          const o = item.quranOccurrence!;
                          setSpeechError(null);
                          playClip(wordAudioUrl(o.chapter, o.verse, o.word)).catch(() =>
                            setSpeechError("Couldn't load the recitation — check your connection.")
                          );
                        }}
                        title={`Hear it recited in the Qur'an: ${item.quranOccurrence.surface} (${item.quranOccurrence.chapter}:${item.quranOccurrence.verse}) — audio: Quran.com`}
                        aria-label={`Hear ${item.wordAr} recited in the Qur'an`}
                        className="rounded-full px-1.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-600/40 transition hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/30"
                      >
                        Qur&apos;an
                      </button>
                    )}
                  </div>
                  <div className="text-muted">{item.meaningEn}</div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={busy}
                  aria-label={`Delete ${item.wordAr}`}
                  className="shrink-0 rounded-full p-1 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
