import "server-only";
import { ApiError, badRequest } from "@/server/constants";
import { db } from "@/server/databases";
import { GeminiNotConfiguredError, GeminiQuotaExhaustedError, generateStructured } from "@/server/helpers";
import { requireOwner } from "./access";
import { buildDocumentText, buildSummaryPrompt, SUMMARY_RESPONSE_SCHEMA, type SummaryResult } from "./summarize";

/**
 * FR-2.2/2.3 chapter summary + Fawā'id extraction. Uses Gemini (see
 * README.md's AI usage policy). Every result is stored with
 * summary_generated_at set and fawaid.created_by = 'system', so the UI can
 * label it "AI-generated, unverified" distinctly from anything curated.
 *
 * Owner only: it spends Gemini quota and overwrites the document's summary
 * for everyone. Generating again replaces the earlier AI fawā'id instead of
 * piling a second copy on top of them.
 */
export async function summarizeDocument(userId: string, id: string) {
  await requireOwner(userId, id, "generate a summary");
  const document = await db.library_documents.findUniqueOrThrow({ where: { id }, select: { title: true } });

  const textUnits = await db.library_text_units.findMany({ where: { document_id: id }, orderBy: { sequence_in_doc: "asc" } });
  if (textUnits.length === 0) throw badRequest("There's no extracted text to summarize yet.");

  const job = await db.extraction_jobs.create({ data: { document_id: id, job_type: "summarize", status: "running", started_at: new Date() } });

  try {
    const { text: documentText } = buildDocumentText(textUnits.map((u) => ({ pageNumber: u.page_number, text: u.raw_text })));
    const result = await generateStructured<SummaryResult>(buildSummaryPrompt(document.title, documentText), SUMMARY_RESPONSE_SCHEMA);

    const pageToUnitId = new Map(textUnits.map((u) => [u.page_number, u.id]));
    const fawaid = result.fawaid.filter((f) => pageToUnitId.has(f.pageNumber));

    await db.$transaction([
      db.fawaid.deleteMany({ where: { created_by: "system", library_text_units: { document_id: id } } }),
      db.library_documents.update({
        where: { id },
        data: { summary_en: result.summaryEn, summary_ar: result.summaryAr ?? null, summary_generated_at: new Date() },
      }),
      db.fawaid.createMany({
        data: fawaid.map((f) => ({
          library_text_unit_id: pageToUnitId.get(f.pageNumber)!,
          category: f.category,
          title: f.title,
          body_en: f.bodyEn ?? null,
          body_ar: f.bodyAr ?? null,
          created_by: "system",
        })),
      }),
      db.extraction_jobs.update({ where: { id: job.id }, data: { status: "completed", completed_at: new Date() } }),
    ]);

    return { summaryEn: result.summaryEn, summaryAr: result.summaryAr, fawaidCount: fawaid.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed";
    await db.extraction_jobs.update({ where: { id: job.id }, data: { status: "failed", completed_at: new Date(), error_message: message } });
    // Not-configured and quota errors get their own clear message from the route handler.
    if (err instanceof GeminiNotConfiguredError || err instanceof GeminiQuotaExhaustedError) throw err;
    console.error("Summary generation failed:", err);
    throw new ApiError(502, "Couldn't generate the summary right now — please try again in a little while.");
  }
}
