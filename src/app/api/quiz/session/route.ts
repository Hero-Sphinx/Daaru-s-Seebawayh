import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { generateQuizQuestions } from "@/helpers/quiz/generate";
import { shuffle } from "@/helpers/quiz/primitives";
import { DIFFICULTIES, getDistractorContext, loadQuranWordItems, loadVocabularyItems, type Difficulty } from "@/server/services/quiz/sources";
import { generateFromTemplates } from "@/helpers/quiz/templateEngine";
import { parseTemplateBody, type LoadedTemplate, type QuizItem, type QuizSource, type QuizTopic } from "@/helpers/quiz/templateTypes";

/**
 * Builds a Quiz Center session server-side (ROADMAP.md Phase 4): questions
 * come from the authored quiz_templates rows (interpreted by the template
 * engine against the Qur'an corpus and the learner's vocabulary), blended
 * with the curated I'rab-role and wazn banks from src/helpers/quiz/generate.ts.
 * Every question names the template it came from, so attempts are logged
 * against it.
 */

const MAX_COUNT = 30;
/** Qur'an words sampled per session — several per question so filters (noun-only etc.) still leave plenty. */
const QURAN_SAMPLE_SIZE = 240;
/** Curated-bank question -> the legacy template it's logged under (code = quiz_type). */
const CURATED_TEMPLATE_CODE = { irab: "irab_reconstruction", sarf: "wazn_identification" } as const;

/**
 * What a session covers. "vocab_sarf" is the learner's own words plus
 * Qur'anic roots, verb forms and tenses — enriching the vocabulary they
 * already know with the patterns around it.
 */
type SessionTopic = "mixed" | "vocab_sarf" | QuizTopic;
const TOPIC_SETS: Record<Exclude<SessionTopic, "mixed">, QuizTopic[]> = {
  vocab: ["vocab"],
  irab: ["irab"],
  sarf: ["sarf"],
  vocab_sarf: ["vocab", "sarf"],
};

interface SessionBody {
  topic?: SessionTopic;
  count?: number;
  difficulty?: Difficulty;
}

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

export async function POST(request: Request) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const body = (await request.json().catch(() => ({}))) as SessionBody;
  const topic = body.topic ?? "mixed";
  if (!["mixed", "vocab", "irab", "sarf", "vocab_sarf"].includes(topic)) {
    return NextResponse.json({ error: "topic must be mixed | vocab | irab | sarf | vocab_sarf" }, { status: 400 });
  }
  /** Topics included in this session (null = all). */
  const wanted: QuizTopic[] | null = topic === "mixed" ? null : TOPIC_SETS[topic];
  const includes = (t: QuizTopic) => wanted === null || wanted.includes(t);
  const difficulty: Difficulty = DIFFICULTIES.includes(body.difficulty as Difficulty) ? (body.difficulty as Difficulty) : "beginner";
  const count = Math.min(Math.max(Math.trunc(body.count ?? 10), 1), MAX_COUNT);

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
  const itemsBySource: Partial<Record<QuizSource, QuizItem[]>> = {};
  const vocabulary = await loadVocabularyItems(userId);
  if (needed.has("vocabulary")) itemsBySource.vocabulary = vocabulary;
  const [quranItems, ctx] = await Promise.all([
    needed.has("quran_word") ? loadQuranWordItems(difficulty, QURAN_SAMPLE_SIZE) : Promise.resolve([]),
    getDistractorContext(),
  ]);
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

  return NextResponse.json({
    questions,
    difficulty,
    note:
      questions.length < count
        ? (topic === "vocab" || topic === "vocab_sarf") && vocabulary.length < 4
          ? "Add a few more words to your vocabulary bank for more vocabulary questions."
          : "Fewer questions than requested were available for this topic and difficulty."
        : undefined,
  });
}
