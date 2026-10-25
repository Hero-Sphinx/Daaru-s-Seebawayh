// Book flashcards (src/constants/data/flashcards/) — hand-written decks, one per chapter of a book.

export interface BilingualText {
  en: string;
  /** Vowelled Arabic. */
  ar: string;
}

/** What a card asks for — shown as a small label so the learner knows what kind of answer is expected. */
export type FlashcardKind =
  | "principle" // recall a chapter's title
  | "term" // a term the author defines
  | "point" // a main point in the author's words
  | "list" // the parts of something he lists
  | "example" // a likeness he draws
  | "cloze" // fill in the blank
  | "evidence" // an āyah and what it proves
  | "hadith"
  | "quote" // who said it, or what they said
  | "story" // an account from the lives of the scholars
  | "poetry"; // complete a line of verse

export interface Flashcard {
  kind: FlashcardKind;
  /** Page of the source PDF the card comes from. */
  page: number;
  front: BilingualText;
  back: BilingualText;
  /** Shown under the answer: who narrated or said it, or a short clarification. */
  note?: BilingualText;
}

/** One chapter of a book (e.g. one of the twenty principles), practised on its own. */
export interface FlashcardSection {
  number: number;
  /** "The First Principle" / "المَعْقِدُ الأَوَّلُ". */
  label: BilingualText;
  title: BilingualText;
  /** First and last page of the chapter in the source PDF. */
  pages: [number, number];
  cards: Flashcard[];
}

export interface FlashcardBook {
  slug: string;
  title: BilingualText;
  /** For headers above a single deck, e.g. "Taʿẓīm al-ʿIlm". */
  shortTitle: string;
  author: BilingualText;
  /** What its chapters are called, plural: "principles" / "المَعَاقِدُ", "chapters" / "الأَبْوَابُ". */
  chapters: BilingualText;
  /** The subject, for grouping and filtering the shelf (e.g. "Manners of seeking knowledge"). */
  subject: string;
  /** One line for the shelf, in English. */
  blurb: string;
  /**
   * Taught in a class: each deck opens to students only once an admin unlocks it
   * after the lesson (/admin, table flashcard_releases). Otherwise every deck is open.
   */
  releasedWithClass?: boolean;
  /**
   * Whose text the cards quote. `english: "edition"` — both languages come from a
   * bilingual edition; `"ours"` — the Arabic is the edition's and the English is our
   * own translation (said so on the book and deck pages).
   */
  source: { name: string; url: string; english: "edition" | "ours" };
  sections: FlashcardSection[];
}
