import type { FreeTextParseResult } from "./free-text-parser";

/**
 * Scores one parse against a gold analysis (see __fixtures__/gold.ts),
 * word by word:
 *   wrong    — some word got a role the gold contradicts (the one outcome
 *              that must never happen: a confident, false analysis);
 *   refused  — nothing contradicts the gold, but some word was left
 *              unplaced (the parser declined, and said so);
 *   correct  — every word's pieces carry exactly the gold roles.
 */
export type Verdict = "correct" | "refused" | "wrong";

export interface Score {
  verdict: Verdict;
  /** Human-readable per-word problems, for the report. */
  issues: string[];
}

export function scoreParse(result: FreeTextParseResult, gold: string): Score {
  const goldWords = gold.trim().split(/\s+/);
  const byWord = new Map<number, (string | null)[]>();
  const surfaceOf = new Map<number, string>();
  for (const t of result.tokens) {
    byWord.set(t.wordIndex, [...(byWord.get(t.wordIndex) ?? []), t.role]);
    surfaceOf.set(t.wordIndex, (surfaceOf.get(t.wordIndex) ?? "") + t.surface);
  }
  if (byWord.size !== goldWords.length) {
    return { verdict: "wrong", issues: [`gold has ${goldWords.length} words, the parse ${byWord.size}`] };
  }

  const issues: string[] = [];
  let wrong = false;
  let refused = false;
  goldWords.forEach((g, w) => {
    const got = byWord.get(w) ?? [];
    const expected = g.split("+");
    if (got.every((r) => r === null)) {
      refused = true;
      issues.push(`${surfaceOf.get(w)}: unplaced (gold ${g})`);
      return;
    }
    const gotStr = got.map((r) => r ?? "∅").join("+");
    if (gotStr !== g) {
      wrong = true;
      issues.push(`${surfaceOf.get(w)}: ${gotStr} ≠ gold ${g}`);
    }
  });
  return { verdict: wrong ? "wrong" : refused ? "refused" : "correct", issues };
}
