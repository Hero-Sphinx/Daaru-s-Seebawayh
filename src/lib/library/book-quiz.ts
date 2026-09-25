export type BookQuizSubtype = "fawaid_recall" | "irab_reconstruction" | "book_comprehension" | "sentence_meaning_match";

export interface StoredQuestionPayload {
  promptEn: string;
  promptAr?: string;
  options: string[];
  pageNumber?: number;
  ruleReference?: string;
}

export interface PlayableBookQuizQuestion {
  id: number;
  subtype: BookQuizSubtype;
  promptEn: string;
  promptAr?: string;
  options: string[];
  correctIndex: number;
  pageNumber?: number;
  ruleReference?: string;
}
