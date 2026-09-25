/** Coarse syntactic category, mapped from CAMeL Tools' finer-grained POS tags. */
export type CoarsePos = "verb" | "noun" | "particle" | "other";

const PARTICLE_POS = new Set([
  "prep",
  "conj",
  "part_neg",
  "part_voc",
  "part_det",
  "part_fut",
  "part_prog",
  "part_restrict",
  "part_verb",
  "part_focus",
  "interj",
  "abbrev",
  "punc",
]);

export function coarsePos(pos: string): CoarsePos {
  if (pos.startsWith("verb")) return "verb";
  if (pos.startsWith("noun") || pos.startsWith("adj") || pos.startsWith("pron")) return "noun";
  if (PARTICLE_POS.has(pos)) return "particle";
  return "other";
}
