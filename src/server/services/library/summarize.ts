export interface SummarizePage {
  pageNumber: number | null;
  text: string;
}

export interface FawaidItem {
  category: "vocabulary" | "balaghah" | "idiom" | "grammar_note";
  title: string;
  bodyEn?: string;
  bodyAr?: string;
  pageNumber: number;
}

export interface SummaryResult {
  summaryEn: string;
  summaryAr?: string;
  fawaid: FawaidItem[];
}

export const SUMMARY_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summaryEn: { type: "string", description: "2-4 paragraph English summary of the text's core themes and arguments" },
    summaryAr: { type: "string", description: "Arabic summary, same content" },
    fawaid: {
      type: "array",
      description: "Notable linguistic/grammatical/rhetorical gems actually found in the text, each grounded to a specific page",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["vocabulary", "balaghah", "idiom", "grammar_note"] },
          title: { type: "string", description: "Short title, e.g. the term or idiom itself" },
          bodyEn: { type: "string" },
          bodyAr: { type: "string" },
          pageNumber: { type: "integer", description: "The page number this was found on, from the provided page markers" },
        },
        required: ["category", "title", "pageNumber"],
      },
    },
  },
  required: ["summaryEn", "fawaid"],
};

const MAX_PROMPT_CHARS = 40_000;

/** Concatenates pages with page markers, truncating to a char budget so a large book doesn't blow the context window. */
export function buildDocumentText(pages: SummarizePage[], maxChars = MAX_PROMPT_CHARS): { text: string; truncated: boolean } {
  let text = "";
  for (const page of pages) {
    const marker = `\n\n--- Page ${page.pageNumber ?? "?"} ---\n${page.text}`;
    if (text.length + marker.length > maxChars) {
      return { text, truncated: true };
    }
    text += marker;
  }
  return { text, truncated: false };
}

export function buildSummaryPrompt(title: string, documentText: string): string {
  return `You are analyzing a page from an Arabic-language text titled "${title}" for an Arabic-learning app.

Below is the extracted text, with page markers. Write:
1. A summary (English, and Arabic if you can) of the core themes, arguments, and structure — only based on what's actually in the text below, not general knowledge about the title.
2. A list of "fawa'id" (beneficial gems) actually present in this text: rare/high-value vocabulary, idioms, notable grammatical points, or rhetorical (balaghah) highlights. Only include things genuinely present in the excerpt — do not invent examples. For each, cite the exact page number (from the "--- Page N ---" markers) it came from.

Text:
${documentText}`;
}
