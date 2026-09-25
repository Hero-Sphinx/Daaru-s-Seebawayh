import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getApiUserId, unauthorizedResponse } from "@/lib/auth";
import { accessibleDocumentsWhere, isUuid } from "@/lib/library/access";
import { candidatesFor } from "@/lib/irab/candidates";
import { buildFawaidQuestions, buildIrabExcerptQuestions, selectSentencesForMeaningMatch } from "@/lib/quiz/book-generate";
import { buildDocumentText } from "@/lib/library/summarize";
import { buildComprehensionPrompt, COMPREHENSION_RESPONSE_SCHEMA, type ComprehensionQuestion } from "@/lib/library/quiz-comprehension";
import { buildMeaningMatchQuestions } from "@/lib/library/quiz-meaning-match";
import { generateStructured, GeminiNotConfiguredError } from "@/lib/gemini-client";
import type { StoredQuestionPayload, PlayableBookQuizQuestion, BookQuizSubtype } from "@/lib/library/book-quiz";

async function getTemplateId(quizType: string): Promise<bigint> {
  const template = await db.quiz_templates.findFirstOrThrow({ where: { quiz_type: quizType } });
  return template.id;
}

interface TextUnitInput {
  page_number: number | null;
  raw_text: string;
}

/** Deterministic, no network call — but still run alongside the others rather than before them. */
async function generateFawaidQuestions(
  documentId: string,
  fawaidRows: { id: number; title: string; bodyEn: string | null; pageNumber: number | null }[]
): Promise<number> {
  const questions = buildFawaidQuestions(fawaidRows, Math.random);
  if (questions.length === 0) return 0;

  const templateId = await getTemplateId("fawaid_recall");
  await db.$transaction(
    questions.map((q) =>
      db.quiz_questions.create({
        data: {
          template_id: templateId,
          source_library_document_id: documentId,
          difficulty_tier: "beginner",
          question_payload: { promptEn: q.promptEn, promptAr: q.promptAr, options: q.options, pageNumber: q.pageNumber },
          correct_answer: { index: q.correctIndex },
        },
      })
    )
  );
  return questions.length;
}

/** Deterministic, but calls the CAMeL service per (Arabic) word — the slowest of the three when CAMeL is slow/unreachable. */
async function generateIrabQuestions(documentId: string, textUnits: TextUnitInput[]): Promise<number> {
  try {
    const questions = await buildIrabExcerptQuestions(
      textUnits.map((u) => ({ pageNumber: u.page_number, text: u.raw_text })),
      (word) => candidatesFor(word),
      Math.random
    );
    if (questions.length === 0) return 0;

    const templateId = await getTemplateId("irab_reconstruction");
    await db.$transaction(
      questions.map((q) =>
        db.quiz_questions.create({
          data: {
            template_id: templateId,
            source_library_document_id: documentId,
            difficulty_tier: "beginner",
            question_payload: {
              promptEn: q.promptEn,
              promptAr: q.promptAr,
              options: q.options,
              pageNumber: q.pageNumber,
              ruleReference: q.ruleReference,
            },
            correct_answer: { index: q.correctIndex },
          },
        })
      )
    );
    return questions.length;
  } catch {
    // CAMeL service unreachable/slow — skip this subtype, don't fail the whole generation.
    return 0;
  }
}

/** The one subtype that needs Gemini; skipped, not failed, if unconfigured. */
async function generateComprehensionQuestions(documentId: string, title: string, textUnits: TextUnitInput[]): Promise<number> {
  try {
    const { text: documentText } = buildDocumentText(textUnits.map((u) => ({ pageNumber: u.page_number, text: u.raw_text })));
    const prompt = buildComprehensionPrompt(title, documentText);
    const result = await generateStructured<{ questions: ComprehensionQuestion[] }>(prompt, COMPREHENSION_RESPONSE_SCHEMA);
    const validQuestions = result.questions.filter((q) => q.options.length >= 2 && q.correctIndex >= 0 && q.correctIndex < q.options.length);
    if (validQuestions.length === 0) return 0;

    const templateId = await getTemplateId("book_comprehension");
    await db.$transaction(
      validQuestions.map((q) =>
        db.quiz_questions.create({
          data: {
            template_id: templateId,
            source_library_document_id: documentId,
            difficulty_tier: "beginner",
            question_payload: { promptEn: q.questionEn, options: q.options, pageNumber: q.pageNumber },
            correct_answer: { index: q.correctIndex },
          },
        })
      )
    );
    return validQuestions.length;
  } catch (err) {
    if (!(err instanceof GeminiNotConfiguredError)) {
      console.error("Book comprehension quiz generation failed:", err);
    }
    return 0;
  }
}

/** The other Gemini subtype — batched into one translation request, not one per sentence (see quiz-meaning-match.ts). */
async function generateMeaningMatchQuestions(documentId: string, textUnits: TextUnitInput[]): Promise<number> {
  const sentences = selectSentencesForMeaningMatch(textUnits.map((u) => ({ pageNumber: u.page_number, text: u.raw_text })));
  if (sentences.length === 0) return 0;
  const questions = await buildMeaningMatchQuestions(sentences, Math.random);
  if (questions.length === 0) return 0;

  const templateId = await getTemplateId("sentence_meaning_match");
  await db.$transaction(
    questions.map((q) =>
      db.quiz_questions.create({
        data: {
          template_id: templateId,
          source_library_document_id: documentId,
          difficulty_tier: "beginner",
          question_payload: { promptEn: q.promptEn, promptAr: q.promptAr, options: q.options, pageNumber: q.pageNumber },
          correct_answer: { index: q.correctIndex },
        },
      })
    )
  );
  return questions.length;
}

/**
 * FR-3.1/3.2: generates (once — idempotent) a cached bank of book quiz
 * questions across all four subtypes, **in parallel** — they used to run
 * sequentially, which meant a slow/unreachable CAMeL service or a slow
 * Gemini retry cycle added up rather than overlapping; confirmed live this
 * mattered for a real upload. See each generate*Questions function for why
 * its subtype is built the way it is.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/library/[id]/quiz">) {
  const { id } = await ctx.params;
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const document = isUuid(id) ? await db.library_documents.findFirst({ where: { id, ...accessibleDocumentsWhere(userId) } }) : null;
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existingCount = await db.quiz_questions.count({ where: { source_library_document_id: id } });
  if (existingCount > 0) {
    return NextResponse.json({ generated: false, existingCount });
  }

  const textUnits = await db.library_text_units.findMany({ where: { document_id: id }, orderBy: { sequence_in_doc: "asc" } });
  const fawaidRows = await db.fawaid.findMany({ where: { library_text_units: { document_id: id } }, include: { library_text_units: true } });

  const [fawaidCount, irabCount, comprehensionCount, meaningMatchCount] = await Promise.all([
    generateFawaidQuestions(
      id,
      fawaidRows.map((f) => ({ id: Number(f.id), title: f.title, bodyEn: f.body_en, pageNumber: f.library_text_units?.page_number ?? null }))
    ),
    generateIrabQuestions(id, textUnits),
    generateComprehensionQuestions(id, document.title, textUnits),
    generateMeaningMatchQuestions(id, textUnits),
  ]);

  const counts: Record<BookQuizSubtype, number> = {
    fawaid_recall: fawaidCount,
    irab_reconstruction: irabCount,
    book_comprehension: comprehensionCount,
    sentence_meaning_match: meaningMatchCount,
  };

  return NextResponse.json({ generated: true, counts });
}

export async function GET(_request: Request, ctx: RouteContext<"/api/library/[id]/quiz">) {
  const { id } = await ctx.params;
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const document = isUuid(id) ? await db.library_documents.findFirst({ where: { id, ...accessibleDocumentsWhere(userId) } }) : null;
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db.quiz_questions.findMany({
    where: { source_library_document_id: id },
    include: { quiz_templates: true },
  });

  const questions: PlayableBookQuizQuestion[] = rows.map((r) => {
    const payload = r.question_payload as unknown as StoredQuestionPayload;
    const correctAnswer = r.correct_answer as unknown as { index: number };
    return {
      id: Number(r.id),
      subtype: r.quiz_templates.quiz_type as BookQuizSubtype,
      promptEn: payload.promptEn,
      promptAr: payload.promptAr,
      options: payload.options,
      correctIndex: correctAnswer.index,
      pageNumber: payload.pageNumber,
      ruleReference: payload.ruleReference,
    };
  });

  return NextResponse.json({ questions });
}
