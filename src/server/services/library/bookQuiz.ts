import "server-only";
import { buildFawaidQuestions, buildIrabExcerptQuestions, selectSentencesForMeaningMatch } from "@/helpers";
import { forbidden, notFound } from "@/server/constants";
import { db } from "@/server/databases";
import { GeminiNotConfiguredError, generateStructured } from "@/server/helpers";
import type { BookQuizSubtype, PlayableBookQuizQuestion, StoredQuestionPayload } from "@/types";
import { candidatesFor } from "../irab/candidates";
import { findAccessibleDocument, getDocumentRole } from "./access";
import { buildComprehensionPrompt, COMPREHENSION_RESPONSE_SCHEMA, type ComprehensionQuestion } from "./quizComprehension";
import { buildMeaningMatchQuestions } from "./quizMeaningMatch";
import { buildDocumentText } from "./summarize";

/**
 * FR-3.1/3.2 book quizzes: a cached bank of questions per document across
 * four subtypes, built once and replayed. Only the irab_reconstruction
 * subtype is deterministic grammar; the others rest on Gemini output
 * (comprehension, translations, and fawā'id that were themselves
 * AI-extracted), so they're labelled AI-generated when played.
 */

const AI_SUBTYPES: ReadonlySet<BookQuizSubtype> = new Set(["fawaid_recall", "book_comprehension", "sentence_meaning_match"]);

interface NewQuestion {
  subtype: BookQuizSubtype;
  payload: StoredQuestionPayload;
  correctIndex: number;
}

type TextUnit = { page_number: number | null; raw_text: string };
const asExcerpts = (units: TextUnit[]) => units.map((u) => ({ pageNumber: u.page_number, text: u.raw_text }));

/** Deterministic, no network call. */
async function fawaidQuestions(documentId: string): Promise<NewQuestion[]> {
  const rows = await db.fawaid.findMany({ where: { library_text_units: { document_id: documentId } }, include: { library_text_units: true } });
  return buildFawaidQuestions(
    rows.map((f) => ({ id: Number(f.id), title: f.title, bodyEn: f.body_en, pageNumber: f.library_text_units?.page_number ?? null })),
    Math.random
  ).map((q) => ({
    subtype: "fawaid_recall",
    payload: { promptEn: q.promptEn, promptAr: q.promptAr, options: q.options, pageNumber: q.pageNumber },
    correctIndex: q.correctIndex,
  }));
}

/** Deterministic, but calls the CAMeL service per (Arabic) word — the slowest subtype when CAMeL is slow or asleep. */
async function irabQuestions(units: TextUnit[]): Promise<NewQuestion[]> {
  try {
    const questions = await buildIrabExcerptQuestions(asExcerpts(units), (word) => candidatesFor(word), Math.random);
    return questions.map((q) => ({
      subtype: "irab_reconstruction",
      payload: { promptEn: q.promptEn, promptAr: q.promptAr, options: q.options, pageNumber: q.pageNumber, ruleReference: q.ruleReference },
      correctIndex: q.correctIndex,
    }));
  } catch (err) {
    // CAMeL unreachable/slow — skip this subtype rather than fail the whole bank.
    console.warn("Book quiz: skipped in-context I'rab questions:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Needs Gemini; skipped, not failed, if it isn't available. */
async function comprehensionQuestions(title: string, units: TextUnit[]): Promise<NewQuestion[]> {
  try {
    const { text } = buildDocumentText(asExcerpts(units));
    const result = await generateStructured<{ questions: ComprehensionQuestion[] }>(buildComprehensionPrompt(title, text), COMPREHENSION_RESPONSE_SCHEMA);
    return result.questions
      .filter((q) => q.options.length >= 2 && q.correctIndex >= 0 && q.correctIndex < q.options.length)
      .map((q) => ({ subtype: "book_comprehension", payload: { promptEn: q.questionEn, options: q.options, pageNumber: q.pageNumber }, correctIndex: q.correctIndex }));
  } catch (err) {
    if (!(err instanceof GeminiNotConfiguredError)) console.error("Book comprehension quiz generation failed:", err);
    return [];
  }
}

/** The other Gemini subtype — batched into one translation request, not one per sentence (see quizMeaningMatch.ts). */
async function meaningMatchQuestions(units: TextUnit[]): Promise<NewQuestion[]> {
  const sentences = selectSentencesForMeaningMatch(asExcerpts(units));
  if (sentences.length === 0) return [];
  const questions = await buildMeaningMatchQuestions(sentences, Math.random);
  return questions.map((q) => ({
    subtype: "sentence_meaning_match",
    payload: { promptEn: q.promptEn, promptAr: q.promptAr, options: q.options, pageNumber: q.pageNumber },
    correctIndex: q.correctIndex,
  }));
}

/** Double-clicks and parallel tabs share one generation instead of each building (and paying for) their own. */
const inFlight = new Map<string, Promise<GenerateResult>>();

export interface GenerateResult {
  generated: boolean;
  counts: Record<BookQuizSubtype, number>;
}

/**
 * Builds the document's question bank. Anyone who can read the book may
 * build it the first time; replacing an existing bank (`regenerate`) is the
 * owner's call, since it changes the quiz for everyone it's shared with.
 */
export async function generateBookQuiz(userId: string, documentId: string, regenerate: boolean): Promise<GenerateResult> {
  const document = await findAccessibleDocument(userId, documentId);
  if (!document) throw notFound();
  if (regenerate && (await getDocumentRole(userId, documentId)) !== "owner") throw forbidden("Only the owner can rebuild this book's quiz.");

  const key = `${documentId}:${regenerate}`;
  const running = inFlight.get(key);
  if (running) return running;
  const work = buildAndStore(documentId, document.title, regenerate).finally(() => inFlight.delete(key));
  inFlight.set(key, work);
  return work;
}

async function buildAndStore(documentId: string, title: string, regenerate: boolean): Promise<GenerateResult> {
  const counts: Record<BookQuizSubtype, number> = { fawaid_recall: 0, irab_reconstruction: 0, book_comprehension: 0, sentence_meaning_match: 0 };
  if (!regenerate && (await db.quiz_questions.count({ where: { source_library_document_id: documentId } })) > 0) {
    return { generated: false, counts };
  }

  const units = await db.library_text_units.findMany({ where: { document_id: documentId }, orderBy: { sequence_in_doc: "asc" } });
  // In parallel: a slow CAMeL service or a Gemini retry cycle overlap
  // instead of adding up (confirmed live this mattered for a real upload).
  const batches = await Promise.all([fawaidQuestions(documentId), irabQuestions(units), comprehensionQuestions(title, units), meaningMatchQuestions(units)]);
  const questions = batches.flat();

  const templates = await db.quiz_templates.findMany({ where: { quiz_type: { in: Object.keys(counts) } }, select: { id: true, quiz_type: true } });
  const templateId = new Map(templates.map((t) => [t.quiz_type, t.id]));

  const stored = await db.$transaction(async (tx) => {
    // One writer per document, across server instances too.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${documentId}))`;
    const existing = await tx.quiz_questions.findMany({ where: { source_library_document_id: documentId }, select: { id: true } });
    if (existing.length > 0) {
      if (!regenerate) return false; // someone else finished first — keep theirs
      const ids = existing.map((q) => q.id);
      await tx.quiz_attempts.updateMany({ where: { question_id: { in: ids } }, data: { question_id: null } });
      await tx.quiz_questions.deleteMany({ where: { id: { in: ids } } });
    }
    await tx.quiz_questions.createMany({
      data: questions
        .filter((q) => templateId.has(q.subtype))
        .map((q) => ({
          template_id: templateId.get(q.subtype)!,
          source_library_document_id: documentId,
          difficulty_tier: "beginner",
          question_payload: { ...q.payload },
          correct_answer: { index: q.correctIndex },
        })),
    });
    return true;
  });

  if (stored) for (const q of questions) counts[q.subtype]++;
  return { generated: stored, counts };
}

export async function getBookQuiz(userId: string, documentId: string): Promise<PlayableBookQuizQuestion[]> {
  if (!(await findAccessibleDocument(userId, documentId))) throw notFound();
  const rows = await db.quiz_questions.findMany({ where: { source_library_document_id: documentId }, include: { quiz_templates: true }, orderBy: { id: "asc" } });
  return rows.map((r) => {
    const payload = r.question_payload as unknown as StoredQuestionPayload;
    const subtype = r.quiz_templates.quiz_type as BookQuizSubtype;
    return {
      id: Number(r.id),
      subtype,
      promptEn: payload.promptEn,
      promptAr: payload.promptAr,
      options: payload.options,
      correctIndex: (r.correct_answer as unknown as { index: number }).index,
      pageNumber: payload.pageNumber,
      ruleReference: payload.ruleReference,
      aiGenerated: AI_SUBTYPES.has(subtype),
    };
  });
}
