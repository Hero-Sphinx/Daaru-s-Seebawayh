/**
 * Word-by-word Qur'an translations render the same lemma many ways in
 * context: "(of) Allah", "Allah", "by Allah"; "they believed", "believe",
 * "(who) believe". For a word card we want one clear dictionary-style
 * meaning plus a few genuinely different renderings, so a learner who meets
 * one word picks up the whole spread of its sense.
 */

export interface GlossCount {
  text: string;
  count: number;
}

export interface GlossSummary {
  /** The most common rendering, cleaned up — null when there is nothing usable. */
  meaning: string | null;
  /** Other distinct renderings, most common first. */
  alternatives: string[];
}

/** Leading function words the translators attach from the word's prefixes/context. */
const LEADING_WORDS = new Set([
  "a", "an", "the", "and", "so", "then", "but", "or", "to", "of", "in", "on", "for", "by", "with", "from", "at",
  "indeed", "surely", "verily", "certainly", "will", "shall", "not", "that", "which", "who", "whom", "o",
  // Pronouns come from attached clitics (رَبُّكَ "your Lord", قَالُوا "they said") — the lemma is the bare word.
  "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their",
  // Tense/voice helpers: "have believed" is the same word as "believed".
  "is", "are", "was", "were", "be", "been", "has", "have", "had", "do", "does", "did",
]);

/** Trailing objects from attached pronouns ("taught him", "have mercy on us") and the prepositions they leave behind. */
const TRAILING_WORDS = new Set(["him", "her", "them", "you", "us", "me", "it", "on", "to", "for", "with", "at", "of", "from", "upon"]);

/** A rendering reduced to its core, keeping its casing: no parenthesised helpers, no leading function words. */
export function coreGloss(text: string): string {
  const words = text
    // "(of) Allah" → "Allah"; "believe(d)" → "believe" (no space, so the stem stays whole).
    .replace(/\([^)]*\)/g, "")
    .replace(/[\[\]"“”.,;:!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  let start = 0;
  // Keep at least one word so "the" alone doesn't vanish entirely.
  while (start < words.length - 1 && LEADING_WORDS.has(words[start].toLowerCase())) start++;
  let end = words.length;
  while (end > start + 1 && TRAILING_WORDS.has(words[end - 1].toLowerCase())) end--;
  return words.slice(start, end).join(" ");
}

/** The comparison key: two renderings with the same key mean the same thing ("Allah's" is "Allah"). */
export function normalizeGloss(text: string): string {
  return coreGloss(text).toLowerCase().replace(/['’]s\b/g, "");
}

export function summarizeGlosses(glosses: GlossCount[], maxAlternatives = 3): GlossSummary {
  const groups = new Map<string, { total: number; shown: string; shownCount: number }>();
  for (const { text, count } of glosses) {
    const shown = coreGloss(text);
    if (!shown || count <= 0) continue;
    const key = normalizeGloss(text);
    const group = groups.get(key) ?? { total: 0, shown, shownCount: 0 };
    group.total += count;
    // Display the casing the translators used most ("Allah", "Book").
    if (count > group.shownCount) {
      group.shown = shown;
      group.shownCount = count;
    }
    groups.set(key, group);
  }
  const ranked = [...groups.values()].sort((a, b) => b.total - a.total || a.shown.localeCompare(b.shown));
  const meaning = ranked[0]?.shown ?? null;
  // "Allah wills", "seven heavens": the meaning plus context words teaches nothing new.
  const meaningKey = meaning ? ` ${normalizeGloss(meaning)} ` : null;
  return {
    meaning,
    alternatives: ranked
      .slice(1)
      .map((g) => g.shown)
      .filter((g) => !meaningKey || !` ${normalizeGloss(g)} `.includes(meaningKey))
      .slice(0, maxAlternatives),
  };
}
