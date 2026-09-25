/** Shared deterministic randomization helpers for quiz generators (client-side and book-quiz). */

/** mulberry32 — small deterministic PRNG so tests can seed a reproducible shuffle. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildOptions(correct: string, pool: string[], rng: () => number): { options: string[]; correctIndex: number } {
  const distractors = shuffle(
    pool.filter((v) => v !== correct),
    rng
  ).slice(0, 3);
  const options = shuffle([correct, ...distractors], rng);
  return { options, correctIndex: options.indexOf(correct) };
}
