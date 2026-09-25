import { shuffle } from "./primitives";

/**
 * Distractor selection that makes a wrong answer *plausible* — the point of
 * Phase 4's "distractor-family tuning". A random root is trivially
 * eliminable (the learner just checks the first letter); a root sharing two
 * radicals in place with the answer actually tests knowledge.
 */

function letters(root: string): string[] {
  return root.split(/\s+/).filter(Boolean);
}

/**
 * Similarity of two roots: 2 points per radical in the same position, 1 per
 * radical shared out of position. Identical roots are excluded by the caller.
 */
export function rootSimilarity(a: string, b: string): number {
  const la = letters(a);
  const lb = letters(b);
  let score = 0;
  const unmatchedB = [...lb];
  la.forEach((ch, i) => {
    if (lb[i] === ch) {
      score += 2;
      unmatchedB[i] = "";
    }
  });
  la.forEach((ch, i) => {
    if (lb[i] === ch) return;
    const j = unmatchedB.indexOf(ch);
    if (j !== -1) {
      score += 1;
      unmatchedB[j] = "";
    }
  });
  return score;
}

/**
 * Up to `n` roots most similar to `root` (never `root` itself). Randomized
 * among the best-scoring candidates so the same question doesn't always
 * show the same three look-alikes; falls back to lower-scoring roots only
 * when there aren't enough close ones.
 */
export function similarRoots(root: string, pool: string[], n: number, rng: () => number): string[] {
  const scored = pool
    .filter((r) => r !== root && letters(r).length === letters(root).length)
    .map((r) => ({ r, score: rootSimilarity(root, r) }))
    .filter((x) => x.score > 0);
  const byScore = new Map<number, string[]>();
  for (const { r, score } of scored) byScore.set(score, [...(byScore.get(score) ?? []), r]);

  const out: string[] = [];
  for (const score of [...byScore.keys()].sort((a, b) => b - a)) {
    for (const r of shuffle(byScore.get(score)!, rng)) {
      if (out.length >= n) return out;
      out.push(r);
    }
  }
  return out;
}

/** Up to `n` distinct values from `pool` other than `correct`, randomly chosen. */
export function poolDistractors(correct: string, pool: string[], n: number, rng: () => number): string[] {
  return shuffle([...new Set(pool.filter((v) => v && v !== correct))], rng).slice(0, n);
}
