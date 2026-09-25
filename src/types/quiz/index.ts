import type { QuizTopic } from "@/helpers";

/** One Quiz Center question, as POST /api/quiz/session returns it. */
export interface SessionQuestion {
  id: string;
  topic: QuizTopic;
  templateCode: string;
  promptEn: string;
  promptAr?: string;
  options: string[];
  correctIndex: number;
  ruleReference?: string;
  explanation?: string;
}

export interface QuizSession {
  questions: SessionQuestion[];
  difficulty: string;
  /** Why fewer questions than asked for came back, if they did. */
  note?: string;
}
