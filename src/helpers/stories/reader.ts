import type { StoryToken } from "@/types";
import { normalizeArabicForSearch } from "../arabic/normalize";

/**
 * Pure helpers for the story reader: splitting a paragraph into tappable
 * words, looking each one up, and cutting text into pieces short enough for
 * the pronunciation endpoint.
 */

/** A run of Arabic letters and vowel marks — the punctuation (، ؟ « » . !) lies outside this range. */
const WORD_RE = /[ء-ٰٟ-ۓ]+/g;

/** How a word is looked up in a story's glossary: letters only, vowels and alif-hamza forms folded. */
export function storyWordKey(word: string): string {
  return normalizeArabicForSearch(word.normalize("NFC"));
}

export function tokenizeParagraph(paragraph: string): StoryToken[] {
  const text = paragraph.normalize("NFC");
  const tokens: StoryToken[] = [];
  let last = 0;
  for (const m of text.matchAll(WORD_RE)) {
    const start = m.index ?? 0;
    if (start > last) tokens.push({ kind: "text", text: text.slice(last, start) });
    tokens.push({ kind: "word", text: m[0], key: storyWordKey(m[0]) });
    last = start + m[0].length;
  }
  if (last < text.length) tokens.push({ kind: "text", text: text.slice(last) });
  return tokens;
}

/** The words of a paragraph, punctuation dropped. */
export function paragraphWords(paragraph: string): string[] {
  return tokenizeParagraph(paragraph).flatMap((t) => (t.kind === "word" ? [t.text] : []));
}

/** The sentence a word sits in (for the vocabulary card's example), punctuation kept. */
export function sentenceAround(paragraph: string, wordIndex: number): string {
  const sentences = paragraph.normalize("NFC").match(/[^.!؟?]+[.!؟?»]*/g) ?? [paragraph];
  let seen = 0;
  for (const s of sentences) {
    seen += paragraphWords(s).length;
    if (wordIndex < seen) return s.trim();
  }
  return paragraph.trim();
}

/**
 * The paragraph as short, punctuation-free phrases of at most `maxLength`
 * characters (the pronunciation endpoint's limit), split between words.
 * A single word longer than the limit stays on its own.
 */
export function speechChunks(paragraph: string, maxLength = 60): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const word of paragraphWords(paragraph)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
