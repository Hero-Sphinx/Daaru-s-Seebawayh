import { NextResponse } from "next/server";
import { tokenizeSentence } from "@/lib/irab/tokenize";
import { isHarfJarr } from "@/lib/irab/particles";
import { CamelServiceUnavailableError } from "@/lib/camel-client";
import { candidatesFor } from "@/lib/irab/candidates";
import { parseFreeText, toSentenceAnalysis, type TokenInput } from "@/lib/irab/free-text-parser";
import { translateSentence } from "@/lib/irab/translate";

interface ParseBody {
  text: string;
  /** Default true (I'rab Workspace wants it). Callers that only need role/case — e.g. the library reader's word-click lookup — pass false to skip the Gemini call entirely, so a click never costs quota. */
  includeTranslation?: boolean;
}

const MAX_WORDS = 12;

/** FR-1.1 free-text I'rab. Deterministic, rule-based — see free-text-parser.ts's header for scope/limitations. */
export async function POST(request: Request) {
  const body = (await request.json()) as ParseBody;
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const includeTranslation = body.includeTranslation ?? true;

  const words = tokenizeSentence(text);
  if (words.length === 0) {
    return NextResponse.json({ error: "No words found in that input" }, { status: 400 });
  }
  if (words.length > MAX_WORDS) {
    return NextResponse.json({ error: `Keep it to ${MAX_WORDS} words or fewer — this parser only handles short sentences.` }, { status: 400 });
  }

  let tokenInputs: TokenInput[];
  let translationEn: string | null;
  try {
    // Independent of the deterministic CAMeL analysis — run concurrently
    // rather than adding Gemini's latency on top of it. Translation is
    // best-effort (see translateSentence): it never throws, so it can't
    // turn into a 502/503 the way the CAMeL calls below still can.
    [tokenInputs, translationEn] = await Promise.all([
      Promise.all(
        words.map(async (w) => {
          if (isHarfJarr(w)) return { surface: w, candidates: [] };
          return { surface: w, candidates: await candidatesFor(w) };
        })
      ),
      includeTranslation ? translateSentence(text) : Promise.resolve(null),
    ]);
  } catch (err) {
    if (err instanceof CamelServiceUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json({ error: "CAMeL Tools service returned an error" }, { status: 502 });
  }

  const result = parseFreeText(tokenInputs);
  const sentence = toSentenceAnalysis(result, "Custom sentence");
  if (translationEn) {
    sentence.translationEn = translationEn;
    sentence.translationSource = "gemini";
  }

  return NextResponse.json({ sentence, warnings: result.warnings, patternMatched: result.patternMatched });
}
