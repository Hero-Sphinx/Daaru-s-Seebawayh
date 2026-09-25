import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { isUuid } from "@/server/services/library/access";
import { generateStructured, GeminiNotConfiguredError } from "@/server/helpers/geminiClient";
import { buildDocumentText, buildSummaryPrompt, SUMMARY_RESPONSE_SCHEMA, type SummaryResult } from "@/server/services/library/summarize";

/**
 * FR-2.2/2.3 chapter summary + Fawā'id extraction. Uses Gemini — the one
 * place in this app that does (see README.md's AI usage policy). Every
 * result is stored with summary_generated_at set and fawaid.created_by =
 * 'system', so the UI can label it "AI-generated, unverified" distinctly
 * from anything QADT/curated.
 */
export async function POST(_request: Request, ctx: RouteContext<"/api/library/[id]/summarize">) {
  const { id } = await ctx.params;
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  // Owner only: it spends Gemini quota and overwrites the document's summary for everyone.
  const document = isUuid(id) ? await db.library_documents.findFirst({ where: { id, owner_user_id: userId } }) : null;
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const textUnits = await db.library_text_units.findMany({
    where: { document_id: id },
    orderBy: { sequence_in_doc: "asc" },
  });
  if (textUnits.length === 0) {
    return NextResponse.json({ error: "No extracted text to summarize" }, { status: 400 });
  }

  const job = await db.extraction_jobs.create({
    data: { document_id: id, job_type: "summarize", status: "running", started_at: new Date() },
  });

  try {
    const { text: documentText } = buildDocumentText(textUnits.map((u) => ({ pageNumber: u.page_number, text: u.raw_text })));
    const prompt = buildSummaryPrompt(document.title, documentText);
    const result = await generateStructured<SummaryResult>(prompt, SUMMARY_RESPONSE_SCHEMA);

    const pageToUnitId = new Map(textUnits.map((u) => [u.page_number, u.id]));
    const fawaidCreates = result.fawaid
      .filter((f) => pageToUnitId.has(f.pageNumber))
      .map((f) =>
        db.fawaid.create({
          data: {
            library_text_unit_id: pageToUnitId.get(f.pageNumber)!,
            category: f.category,
            title: f.title,
            body_en: f.bodyEn ?? null,
            body_ar: f.bodyAr ?? null,
            created_by: "system",
          },
        })
      );

    await db.$transaction([
      db.library_documents.update({
        where: { id },
        data: { summary_en: result.summaryEn, summary_ar: result.summaryAr ?? null, summary_generated_at: new Date() },
      }),
      ...fawaidCreates,
      db.extraction_jobs.update({ where: { id: job.id }, data: { status: "completed", completed_at: new Date() } }),
    ]);

    return NextResponse.json({ summaryEn: result.summaryEn, summaryAr: result.summaryAr, fawaidCount: fawaidCreates.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed";
    await db.extraction_jobs.update({ where: { id: job.id }, data: { status: "failed", completed_at: new Date(), error_message: message } });

    if (err instanceof GeminiNotConfiguredError) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
