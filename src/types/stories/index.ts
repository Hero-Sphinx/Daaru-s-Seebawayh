// Graded Arabic reading stories (src/constants/data/stories.ts).

/** 1: present tense, everyday nouns · 2: past tense, short narration · 3: dialogue and longer sentences. */
export type StoryLevel = 1 | 2 | 3;

export interface StoryGloss {
  /** What the word means here, as written (with its prefixes/suffixes). */
  meaning: string;
  /** Dictionary form for the vocabulary bank, when it differs from the word as written. */
  lemma?: string;
  /** Root letters, space-separated (e.g. "ك ت ب"). */
  root?: string;
  /** A nudge towards the meaning without giving it away. */
  hint?: string;
}

export interface StoryQuestion {
  questionAr: string;
  questionEn: string;
  /** Short Arabic answers. */
  choices: string[];
  /** Index into `choices`. */
  answer: number;
}

export interface Story {
  slug: string;
  level: StoryLevel;
  titleAr: string;
  titleEn: string;
  /** One line for the story list, in English. */
  blurb: string;
  emoji: string;
  /** Fully vowelled paragraphs. */
  paragraphs: string[];
  /**
   * Every word in the story, keyed by its letters (vowels ignored — see
   * storyWordKey). tests/constants/stories.test.ts checks nothing is missing.
   */
  glossary: Record<string, StoryGloss>;
  questions: StoryQuestion[];
  /** The value the story teaches, shown at the end. */
  moral?: { ar: string; en: string };
}

/** One piece of a paragraph: a tappable word or the punctuation/space around it. */
export type StoryToken = { kind: "word"; text: string; key: string } | { kind: "text"; text: string };
