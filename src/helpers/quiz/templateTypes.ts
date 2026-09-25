/**
 * The quiz_templates.template_body contract (ROADMAP.md Phase 4). Templates
 * are authored as data (src/helpers/quiz/templates.ts -> seeded into the DB);
 * src/helpers/quiz/templateEngine.ts interprets them generically — adding a
 * question type is a new template row, not new generator code, as long as
 * it draws on an existing source and distractor strategy.
 */

/** One quizzable fact, from a source loader (src/server/services/quiz/sources.ts). All values are display-ready strings. */
export interface QuizItem {
  key: string;
  surface?: string;
  /** Surrounding text, e.g. the verse (windowed) the word appears in. */
  context?: string;
  /** Human reference for the context, e.g. "2:255". */
  contextRef?: string;
  lemma?: string;
  root?: string;
  caseLabel?: string;
  posLabel?: string;
  posCategory?: string;
  aspectLabel?: string;
  verbFormLabel?: string;
  meaningEn?: string;
  transliteration?: string;
}

export type QuizItemField = Exclude<keyof QuizItem, "key">;

export const QUIZ_SOURCES = ["quran_word", "vocabulary"] as const;
export type QuizSource = (typeof QUIZ_SOURCES)[number];

export type QuizTopic = "vocab" | "irab" | "sarf";

export type DistractorStrategy =
  /** Author-supplied option list (e.g. the three cases). */
  | { strategy: "fixed"; values: string[] }
  /** The answer field's values across the other items in the pool (e.g. other meanings). */
  | { strategy: "pool" }
  /** Roots sharing radicals with the answer root — look-alikes, not random roots. */
  | { strategy: "similar_root" }
  /** Words (lemmas) from look-alike roots — "which word comes from root X?". */
  | { strategy: "lemmas_from_similar_roots" }
  /** Other parts of speech within the answer's own category (noun vs. noun kinds). */
  | { strategy: "pos_same_category" };

export interface TemplateBody {
  version: 1;
  topic: QuizTopic;
  source: QuizSource;
  /** Item filter: every listed field must be present; optional POS category restriction. */
  where?: { posCategory?: "noun" | "verb" | "particle"; require?: QuizItemField[] };
  /** "{field}" placeholders are filled from the item. */
  prompt: { en: string; ar?: string };
  answerField: QuizItemField;
  distractors: DistractorStrategy;
  /** Shown after answering; same placeholders plus {answer}. */
  explanation?: string;
}

/** A template row as the engine consumes it (DB row + parsed body). */
export interface LoadedTemplate {
  id: string;
  code: string;
  quizType: string;
  ruleReference: string | null;
  body: TemplateBody;
}

const FIELDS: QuizItemField[] = [
  "surface",
  "context",
  "contextRef",
  "lemma",
  "root",
  "caseLabel",
  "posLabel",
  "posCategory",
  "aspectLabel",
  "verbFormLabel",
  "meaningEn",
  "transliteration",
];
const STRATEGIES = ["fixed", "pool", "similar_root", "lemmas_from_similar_roots", "pos_same_category"];

/**
 * Validates an untrusted template_body (it's JSONB — anyone with DB access
 * can edit it). Returns the typed body or a list of problems; the session
 * endpoint skips invalid templates rather than crashing a quiz.
 */
export function parseTemplateBody(raw: unknown): { ok: true; body: TemplateBody } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const b = raw as Partial<TemplateBody> | null;
  if (!b || typeof b !== "object") return { ok: false, errors: ["template_body is not an object"] };
  if (b.version !== 1) errors.push("version must be 1");
  if (!["vocab", "irab", "sarf"].includes(b.topic as string)) errors.push("topic must be vocab | irab | sarf");
  if (!QUIZ_SOURCES.includes(b.source as QuizSource)) errors.push(`source must be one of ${QUIZ_SOURCES.join(", ")}`);
  if (!b.prompt || typeof b.prompt.en !== "string" || !b.prompt.en) errors.push("prompt.en is required");
  if (!FIELDS.includes(b.answerField as QuizItemField)) errors.push("answerField is not a known item field");
  if (!b.distractors || !STRATEGIES.includes(b.distractors.strategy)) errors.push("distractors.strategy is not recognized");
  if (b.distractors?.strategy === "fixed" && (!Array.isArray(b.distractors.values) || b.distractors.values.length < 2)) {
    errors.push("fixed distractors need at least 2 values");
  }
  for (const f of b.where?.require ?? []) if (!FIELDS.includes(f)) errors.push(`where.require has unknown field ${f}`);
  return errors.length ? { ok: false, errors } : { ok: true, body: b as TemplateBody };
}
