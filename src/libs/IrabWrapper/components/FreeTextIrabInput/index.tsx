"use client";

import { useState } from "react";
import type { SentenceAnalysis } from "@/types";
import IrabWorkspace from "../IrabWorkspace";

interface ParseResponse {
  sentence: SentenceAnalysis;
  warnings: string[];
  patternMatched: "vso" | "nominal" | "inna" | "negated" | "preverbal" | "fronted_khabar" | "conditional" | "none";
}

const EXAMPLE = "كَتَبَ الطَّالِبُ الدَّرْسَ";

export default function FreeTextIrabInput() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResponse | null>(null);

  async function handleParse(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/irab/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Parsing failed");
      setResult(body as ParseResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parsing failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-800/40 dark:bg-parchment-800/80 dark:text-amber-200">
        This parser is deterministic (no AI) and covers a deliberately narrow set of sentence patterns:
        verb-subject-object, simple topic-predicate (mubtada&apos;-khabar), and an optional trailing preposition
        phrase — each optionally followed by a preposition phrase. It needs <strong>full tashkeel</strong> (diacritics);
        undiacritized Arabic is genuinely ambiguous, so it won&apos;t guess. Anything outside its coverage is reported
        as unparsed rather than guessed.
      </div>

      <form onSubmit={handleParse} className="space-y-2">
        <label htmlFor="free-text-irab" className="block text-xs font-semibold text-muted">
          Type a fully-diacritized Arabic sentence:
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="free-text-irab"
            value={text}
            onChange={(e) => setText(e.target.value)}
            dir="rtl"
            placeholder={EXAMPLE}
            className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2.5 font-arabic text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="shrink-0 rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            {busy ? "Analyzing…" : "Parse"}
          </button>
        </div>
        <button type="button" onClick={() => setText(EXAMPLE)} className="text-xs text-emerald-700 hover:underline dark:text-emerald-400">
          Try an example
        </button>
      </form>

      {error && (
        <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-3">
          {result.warnings.length > 0 && (
            <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              {result.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          )}
          <IrabWorkspace sentence={result.sentence} />
        </div>
      )}
    </div>
  );
}
