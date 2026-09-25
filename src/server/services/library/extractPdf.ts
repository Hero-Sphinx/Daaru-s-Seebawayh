import { extractText, getDocumentProxy } from "unpdf";
import { generateStructuredFromImage, GeminiNotConfiguredError, GeminiQuotaExhaustedError, isGeminiTimeout } from "@/server/helpers/geminiClient";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  /** "ocr" only when unpdf found zero embedded text and Gemini transcribed the page directly from the PDF — see extractPdfText's header. */
  source: "pdf_text" | "ocr";
}

/**
 * Extracts per-page text from a PDF. Always applies Unicode NFKC
 * normalization — tested against a real generated Arabic PDF and confirmed
 * necessary: PDFs that embed pre-shaped Arabic glyphs (Arabic Presentation
 * Forms, U+FB50-FDFF / U+FE70-FEFF — contextual letter shapes, not logical
 * characters) extract as those presentation-form codepoints, which CAMeL
 * Tools and the rest of this app's Arabic processing can't read. NFKC's
 * compatibility decomposition maps them back to standard Arabic Unicode
 * (U+0600-06FF). This is a no-op for PDFs that already embed logical text.
 *
 * Real-world library PDFs are usually not fully diacritized — expect most
 * extracted text to lack tashkeel, same as the free-text I'rab parser
 * already assumes (src/helpers/irab/freeTextParser.ts).
 */
export function normalizePdfText(text: string): string {
  return text.normalize("NFKC").trim();
}

// Gemini has native PDF document understanding — it reads pages (including
// scanned/image-only ones) directly from the file, the same way it reads a
// PDF dropped into a chat. The first version of this OCR fallback missed
// that and instead rendered each empty page to a PNG and sent one request
// per page — slow and fragile (pdf.js rendering bugs). One request with the
// raw PDF bytes, naming which page numbers need transcription, replaces all
// of that. Gemini supports PDFs up to 50MB/1000 pages this way.
//
// Batch size is bounded by *output*, not input: the reply is the
// transcription itself. Confirmed live: 25 dense Arabic pages per request
// (~15k output tokens) blew through a 90s timeout on every batch, and a
// reply that size also risks the model's output-token cap. 6 pages keeps
// each reply to a few thousand tokens; a batch that still times out is
// split and retried (see ocrPages).
export const OCR_BATCH_SIZE = 6;
/** Per-request timeout for OCR — well above a normal call, since the reply is long. */
export const OCR_TIMEOUT_MS = 180_000;

const OCR_SCHEMA = {
  type: "object",
  properties: {
    pages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pageNumber: { type: "integer" },
          text: { type: "string" },
        },
        required: ["pageNumber", "text"],
      },
    },
  },
  required: ["pages"],
};

function buildOcrPrompt(pageNumbers: number[]): string {
  return (
    `This PDF is a scanned/mixed book, likely in Arabic (may include some English). ` +
    `The following page numbers have no extractable text layer: ${pageNumbers.join(", ")}. ` +
    `For each of ONLY those page numbers, transcribe every word of visible text EXACTLY as it ` +
    `appears on that page, preserving line breaks with \\n. ` +
    `Pay close attention to Arabic diacritics (tashkeel/harakat — fatha, damma, kasra, sukun, ` +
    `shadda, tanwin): if a diacritic mark is visibly printed above or below a letter, include it ` +
    `exactly as shown — do not drop it even if it makes the word harder to read. But NEVER add a ` +
    `diacritic that is not actually visible in the image, and never guess one you're unsure about — ` +
    `an invented mark is worse than a missing one, since downstream tools trust this transcription ` +
    `as exactly what's printed. Do not translate, summarize, correct, or add anything not on the ` +
    `page. If a listed page has no readable text (blank, purely decorative, a cover image, ...), ` +
    `return an empty string for its "text". Return one entry per listed page number in the "pages" ` +
    `array — do not skip any, and do not include any other pages.`
  );
}

/**
 * OCRs a batch of pages via Gemini's native PDF understanding — sends the
 * whole PDF once per batch (not per page) and asks for transcriptions of
 * just the listed page numbers. Transcription, not a grammar claim, so
 * it's within the AI usage policy the same way chapter summaries are (see
 * gemini-client.ts's header) — but unlike a summary, this text then feeds
 * the SAME downstream pipeline (word-by-word reading, Fawā'id, quizzes) as
 * directly-extracted text, so every caller that surfaces it must label it
 * "AI-extracted (OCR), unverified" — see ExtractedPage.source.
 */
export async function ocrPageBatch(pdfBase64: string, pageNumbers: number[]): Promise<Map<number, string>> {
  const result = await generateStructuredFromImage<{ pages: { pageNumber: number; text: string }[] }>(
    buildOcrPrompt(pageNumbers),
    OCR_SCHEMA,
    { mimeType: "application/pdf", base64Data: pdfBase64 },
    { timeoutMs: OCR_TIMEOUT_MS }
  );
  const byPage = new Map<number, string>();
  for (const p of result.pages ?? []) {
    // Only accept pages that were actually asked for — never let a model
    // reply overwrite a page that had a real text layer.
    if (pageNumbers.includes(p.pageNumber)) byPage.set(p.pageNumber, normalizePdfText(p.text ?? ""));
  }
  return byPage;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export interface TextLayerResult {
  totalPages: number;
  /** Pages with an embedded text layer (source 'pdf_text'). */
  pages: ExtractedPage[];
  /** Page numbers with no text layer — candidates for OCR. */
  emptyPageNumbers: number[];
  /** The original PDF, base64 — OCR needs the file itself (it's not stored anywhere else). */
  pdfBase64: string;
}

/** Stage 1 (fast, no network): the PDF's own text layer. */
export async function extractTextLayer(buffer: ArrayBuffer | Uint8Array): Promise<TextLayerResult> {
  const bytes = new Uint8Array(buffer);
  // Base64-encode from these bytes BEFORE handing anything to pdf.js —
  // confirmed live: getDocumentProxy/extractText can detach or zero out the
  // buffer it's given, so encoding afterward produced an empty PDF ("The
  // document has no pages" from Gemini). pdf.js gets its own copy.
  const pdfBase64 = Buffer.from(bytes).toString("base64");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const all = text.map((raw, i) => ({ pageNumber: i + 1, text: normalizePdfText(raw), source: "pdf_text" as const }));
  return {
    totalPages,
    pages: all.filter((p) => p.text.length > 0),
    emptyPageNumbers: all.filter((p) => p.text.length === 0).map((p) => p.pageNumber),
    pdfBase64,
  };
}

export interface OcrRunResult {
  /** Pages that came back with text. */
  recovered: number;
  /** Pages that couldn't be transcribed (timeouts on single pages, bad replies). */
  failedPages: number[];
  /** Stopped early: quota ran out (retrying later can recover the rest). */
  quotaExhausted: boolean;
  /** Stopped early: GEMINI_API_KEY isn't set. */
  notConfigured: boolean;
}

type OcrBatchFn = (pdfBase64: string, pageNumbers: number[]) => Promise<Map<number, string>>;

/**
 * Stage 2: OCR the given pages in batches, calling `onPages` as each batch
 * finishes so callers can persist progress incrementally (a failure late
 * in a long book keeps everything before it). A batch that times out is
 * split in half and retried, down to single pages — a slow page shouldn't
 * sink its neighbours. Quota exhaustion / missing key stop everything
 * immediately (they'd fail identically for every remaining batch).
 *
 * `ocrBatch` is injectable for tests; production uses Gemini.
 */
export async function ocrPages(
  pdfBase64: string,
  pageNumbers: number[],
  onPages: (pages: ExtractedPage[]) => Promise<void>,
  ocrBatch: OcrBatchFn = ocrPageBatch
): Promise<OcrRunResult> {
  const result: OcrRunResult = { recovered: 0, failedPages: [], quotaExhausted: false, notConfigured: false };

  async function run(batch: number[]): Promise<void> {
    if (result.quotaExhausted || result.notConfigured) {
      result.failedPages.push(...batch);
      return;
    }
    try {
      const byPage = await ocrBatch(pdfBase64, batch);
      const pages: ExtractedPage[] = [];
      for (const n of batch) {
        const text = byPage.get(n);
        if (text) pages.push({ pageNumber: n, text, source: "ocr" });
      }
      // Pages the model returned empty are genuinely blank (cover, divider) — not failures.
      if (pages.length > 0) await onPages(pages);
      result.recovered += pages.length;
    } catch (err) {
      if (err instanceof GeminiQuotaExhaustedError) {
        result.quotaExhausted = true;
        result.failedPages.push(...batch);
      } else if (err instanceof GeminiNotConfiguredError) {
        result.notConfigured = true;
        result.failedPages.push(...batch);
      } else if (isGeminiTimeout(err) && batch.length > 1) {
        const mid = Math.ceil(batch.length / 2);
        await run(batch.slice(0, mid));
        await run(batch.slice(mid));
      } else {
        console.error(`OCR failed for page(s) ${batch.join(", ")}:`, err instanceof Error ? err.message : err);
        result.failedPages.push(...batch);
      }
    }
  }

  for (const batch of chunk(pageNumbers, OCR_BATCH_SIZE)) await run(batch);
  return result;
}
