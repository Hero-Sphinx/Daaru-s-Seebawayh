"use client";

import { useState } from "react";
import { CheckIcon, XIcon } from "@/components";
import { GRAMMATICAL_ROLES, logQuizAttempt, ROLE_CODES } from "@/constants";
import { gradeReconstruction, isReconstructable, missingAnswers, type ReconstructionGrade, type TokenAnswer } from "@/helpers";
import type { RoleCode, SentenceAnalysis } from "@/types";
import { fetcher } from "@/constants";

const ROOT_VALUE = "root";

/**
 * I'rab reconstruction (ROADMAP.md Phase 5): the learner builds the
 * analysis — each word's role and the word it depends on — then checks it
 * against the verified one. Works on the curated bank and on any typed
 * sentence the deterministic parser fully resolves.
 */
export default function IrabReconstruction({ sentences }: { sentences: SentenceAnalysis[] }) {
  const practiceable = sentences.filter(isReconstructable);
  const [sentence, setSentence] = useState<SentenceAnalysis | null>(practiceable[0] ?? null);
  const [answers, setAnswers] = useState<Record<number, TokenAnswer>>({});
  const [grade, setGrade] = useState<ReconstructionGrade | null>(null);
  // Set when Check is pressed with choices missing — the button is never
  // silently disabled; it says what's left and outlines those dropdowns.
  const [showMissing, setShowMissing] = useState(false);
  const [custom, setCustom] = useState("");
  const [customBusy, setCustomBusy] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  function load(s: SentenceAnalysis) {
    setSentence(s);
    setAnswers({});
    setGrade(null);
    setShowMissing(false);
  }

  async function useTyped(e: React.FormEvent) {
    e.preventDefault();
    if (!custom.trim()) return;
    setCustomBusy(true);
    setCustomError(null);
    try {
      // No translation needed to practise — don't spend Gemini quota.
      const { sentence: parsed } = await fetcher<{ sentence: SentenceAnalysis }>("/api/irab/parse", {
        method: "POST",
        json: { text: custom, includeTranslation: false },
      });
      if (!isReconstructable(parsed)) {
        throw new Error(
          "The parser couldn't verify every word of that sentence, so there's no complete answer key. Try a fully-diacritized sentence in one of the supported patterns."
        );
      }
      load({ ...parsed, sourceLabel: "Your sentence" });
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : "Parsing failed");
    } finally {
      setCustomBusy(false);
    }
  }

  function setAnswer(tokenId: number, patch: Partial<TokenAnswer>) {
    setGrade(null);
    setAnswers((a) => ({ ...a, [tokenId]: { role: a[tokenId]?.role ?? "", headTokenId: a[tokenId]?.headTokenId, ...patch } }));
  }

  function check() {
    if (!sentence) return;
    if (missingAnswers(sentence, answers).length > 0) {
      setShowMissing(true);
      return;
    }
    setShowMissing(false);
    const g = gradeReconstruction(sentence, answers);
    setGrade(g);
    // Best-effort — never interrupt practice over a logging failure.
    logQuizAttempt({ templateCode: "irab_reconstruction", isCorrect: g.allCorrect, userAnswer: `${sentence.sourceLabel}: ${g.points}/${g.maxPoints}` });
  }

  const ordered = sentence ? [...sentence.tokens].sort((a, b) => a.positionInUnit - b.positionInUnit) : [];
  const missing = sentence && showMissing ? missingAnswers(sentence, answers) : [];
  const missingRole = new Set(missing.filter((m) => m.role).map((m) => m.tokenId));
  const missingHead = new Set(missing.filter((m) => m.head).map((m) => m.tokenId));
  const MISSING_RING = "border-amber-500 ring-2 ring-amber-300 dark:ring-amber-700";
  const surfaceOf = (id: number | null) => (id === null ? "— none (sentence root) —" : (sentence?.tokens.find((t) => t.id === id)?.surfaceForm ?? "?"));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700/60 dark:bg-parchment-800 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="recon-sentence" className="block text-xs font-semibold text-muted">
            Practise on a curated sentence:
          </label>
          <select
            id="recon-sentence"
            value={practiceable.some((s) => s.id === sentence?.id) ? sentence?.id : ""}
            onChange={(e) => {
              const s = practiceable.find((x) => x.id === e.target.value);
              if (s) load(s);
            }}
            className="w-full rounded-md border border-stone-300 bg-white px-4 py-2.5 font-arabic text-base dark:border-stone-600 dark:bg-parchment-900"
          >
            <option value="" disabled>
              —
            </option>
            {practiceable.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sourceLabel}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={useTyped} className="flex-1 space-y-1">
          <label htmlFor="recon-custom" className="block text-xs font-semibold text-muted">
            …or type your own (fully diacritized):
          </label>
          <div className="flex gap-2">
            <input
              id="recon-custom"
              dir="rtl"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="كَتَبَ الطَّالِبُ الدَّرْسَ"
              className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 font-arabic dark:border-stone-600 dark:bg-parchment-900"
            />
            <button
              type="submit"
              disabled={customBusy || !custom.trim()}
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {customBusy ? "…" : "Use"}
            </button>
          </div>
        </form>
      </div>
      {customError && <p className="text-sm text-rose-600">{customError}</p>}

      {sentence && (
        <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
          <p dir="rtl" className="arabic-display text-center font-arabic text-emerald-900 dark:text-amber-200">
            {ordered.map((t) => t.surfaceForm).join(" ")}
          </p>
          <p className="text-center text-xs text-stone-500">
            For each word, choose its grammatical role and the word it depends on (its head). The main word of the
            sentence — the verb in a verbal sentence, the mubtada&apos; in a nominal one — depends on nothing: choose
            &ldquo;none (sentence root)&rdquo; for it.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-500">
                  <th className="p-2">Word</th>
                  <th className="p-2">Role (mawqiʿ)</th>
                  <th className="p-2">Depends on</th>
                  {grade && <th className="p-2">Result</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ordered.map((t) => {
                  const a = answers[t.id];
                  const g = grade?.tokens.find((x) => x.tokenId === t.id);
                  return (
                    <tr key={t.id}>
                      <td dir="rtl" className="p-2 font-arabic text-xl">
                        {t.surfaceForm}
                      </td>
                      <td className="p-2">
                        <select
                          aria-label={`Role of ${t.surfaceForm}`}
                          value={a?.role ?? ""}
                          onChange={(e) => setAnswer(t.id, { role: e.target.value as RoleCode })}
                          className={`w-full rounded-lg border px-2 py-1.5 dark:bg-parchment-900 ${
                            g ? (g.roleCorrect ? "border-emerald-500" : "border-rose-500") : missingRole.has(t.id) ? MISSING_RING : "border-border"
                          }`}
                        >
                          <option value="">Choose…</option>
                          {ROLE_CODES.map((code) => (
                            <option key={code} value={code}>
                              {GRAMMATICAL_ROLES[code].nameEn} — {GRAMMATICAL_ROLES[code].nameAr}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          aria-label={`Head of ${t.surfaceForm}`}
                          value={a?.headTokenId === undefined ? "" : a.headTokenId === null ? ROOT_VALUE : String(a.headTokenId)}
                          onChange={(e) => setAnswer(t.id, { headTokenId: e.target.value === ROOT_VALUE ? null : Number(e.target.value) })}
                          className={`w-full rounded-lg border px-2 py-1.5 font-arabic dark:bg-parchment-900 ${
                            g ? (g.headCorrect ? "border-emerald-500" : "border-rose-500") : missingHead.has(t.id) ? MISSING_RING : "border-border"
                          }`}
                        >
                          <option value="" disabled>
                            Choose…
                          </option>
                          <option value={ROOT_VALUE}>— none (sentence root) —</option>
                          {ordered
                            .filter((o) => o.id !== t.id)
                            .map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.surfaceForm}
                              </option>
                            ))}
                        </select>
                      </td>
                      {grade && g && (
                        <td className="p-2 text-xs">
                          {g.roleCorrect && g.headCorrect ? (
                            <CheckIcon className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <span className="flex items-start gap-1 text-rose-700 dark:text-rose-300">
                              <XIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span>
                                {GRAMMATICAL_ROLES[g.expectedRole].nameEn}, depends on{" "}
                                <span className="font-arabic">{surfaceOf(g.expectedHeadTokenId)}</span>
                                {GRAMMATICAL_ROLES[g.expectedRole].ruleReference && (
                                  <span className="block text-stone-500">{GRAMMATICAL_ROLES[g.expectedRole].ruleReference}</span>
                                )}
                              </span>
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {missing.length > 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Still to choose:{" "}
                {missing
                  .map((m) => {
                    const w = sentence.tokens.find((t) => t.id === m.tokenId)?.surfaceForm;
                    return [m.role && `the role of ${w}`, m.head && `what ${w} depends on`].filter(Boolean).join(" and ");
                  })
                  .join("; ")}
                .
              </p>
            ) : grade ? (
              <p className={`text-sm font-semibold ${grade.allCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                {grade.allCorrect ? "Perfect — every role and head is right!" : `${grade.points} of ${grade.maxPoints} correct. Fix the red ones and check again.`}
              </p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={check}
              className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              Check my I&apos;rab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
