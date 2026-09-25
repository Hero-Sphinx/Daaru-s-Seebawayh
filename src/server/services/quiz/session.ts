import "server-only";
import type { z } from "zod";
import { generateFromTemplates, generateQuizQuestions, type LoadedTemplate, parseTemplateBody, type QuizItem, type QuizSource, type QuizTopic, shuffle } from "@/helpers";
import { db } from "@/server/databases";
import type { sessionBodySchema } from "@/server/validators/quiz/validate";
import type { QuizSession, SessionQuestion } from "@/types";
import { getDistractorContext, loadQuranWordItems, loadVocabularyItems } from "./sources";

/**
 * Builds a Quiz Center session server-side (ROADMAP.md Phase 4): questions
 * come from the authored quiz_templates rows (interpreted by the template
 * engine against the Qur'an corpus and the learner's vocabulary), blended
 * with the curated I'rab-role and wazn banks from src/helpers/quiz/generate.ts.
 * Every question names the template it came from, so attempts are logged
 * against it.
 */

/** Qur'an words sampled per session — several per question so filters (noun-only etc.) still leave plenty. */
const QURAN_SAMPLE_SIZE = 240;
/** Curated-bank question -> the legacy template it's logged under (code = quiz_type). */
const CURATED_TEMPLATE_CODE = { irab: "irab_reconstruction", sarf: "wazn_identification" } as const;

type SessionRequest = z.infer<typeof sessionBodySchema>;

/**
 * What a session covers. "vocab_sarf" is the learner's own words plus
 * Qur'anic roots, verb forms and tenses — enriching the vocabulary they
 * already know with the patterns around it.
 */
const TOPIC_SETS: Record<Exclude<SessionRequest["topic"], "mixed">, QuizTopic[]> = {
  vocab: ["vocab"],
  irab: ["irab"],
  sarf: ["sarf"],
  vocab_sarf: ["vocab", "sarf"],
};

export async function buildQuizSession(userId: string, { topic, count, difficulty }: SessionRequest): Promise<QuizSession> {
  /** Topics included in this session (null = all). */
  const wanted: QuizTopic[] | null = topic === "mixed" ? null : TOPIC_SETS[topic];
  const includes = (t: QuizTopic) => wanted === null || wanted.includes(t);

  // --- templates (DB is the runtime source of truth; invalid bodies are skipped, not fatal)
  const rows = await db.quiz_templates.findMany({ where: { code: { not: null } } });
  const templates: LoadedTemplate[] = [];
  for (const row of rows) {
    const parsed = parseTemplateBody(row.template_body);
    if (!parsed.ok) continue; // legacy rows have an empty body by design
    if (!includes(parsed.body.topic)) continue;
    templates.push({ id: row.id.toString(), code: row.code!, quizType: row.quiz_type, ruleReference: row.rule_reference, body: parsed.body });
  }

  // --- only load the sources these templates actually need
  const needed = new Set(templates.map((t) => t.body.source));
  const [vocabulary, quranItems, ctx] = await Promise.all([
    loadVocabularyItems(userId),
    needed.has("quran_word") ? loadQuranWordItems(difficulty, QURAN_SAMPLE_SIZE) : Promise.resolve([]),
    getDistractorContext(),
  ]);
  const itemsBySource: Partial<Record<QuizSource, QuizItem[]>> = {};
  if (needed.has("vocabulary")) itemsBySource.vocabulary = vocabulary;
  if (needed.has("quran_word")) itemsBySource.quran_word = quranItems;

  const rng = Math.random;
  const templated: SessionQuestion[] = generateFromTemplates(templates, itemsBySource, ctx, count, rng).map((q) => ({
    id: q.id,
    topic: q.topic,
    templateCode: q.templateCode,
    promptEn: q.promptEn,
    promptAr: q.promptAr,
    options: q.options,
    correctIndex: q.correctIndex,
    ruleReference: q.ruleReference,
    explanation: q.explanation,
  }));

  // --- curated banks (hand-verified sentence roles, wazn examples)
  const curated: SessionQuestion[] = [];
  for (const t of ["irab", "sarf"] as const) {
    if (!includes(t)) continue;
    for (const q of generateQuizQuestions(t, count, [], rng)) {
      curated.push({
        id: q.id,
        topic: t,
        templateCode: CURATED_TEMPLATE_CODE[t],
        promptEn: q.promptEn,
        promptAr: q.promptAr,
        options: q.options,
        correctIndex: q.correctIndex,
        ruleReference: q.ruleReference,
      });
    }
  }

  // Curated questions are a small, fixed bank; cap their share so a session
  // is mostly fresh corpus-driven questions rather than the same dozen.
  const curatedShare = curated.slice(0, Math.ceil(count / 4));
  const questions = shuffle([...templated, ...curatedShare], rng).slice(0, count);

  return {
    questions,
    difficulty,
    note:
      questions.length < count
        ? (topic === "vocab" || topic === "vocab_sarf") && vocabulary.length < 4
          ? "Add a few more words to your vocabulary bank for more vocabulary questions."
          : "Fewer questions than requested were available for this topic and difficulty."
        : undefined,
  };
}
