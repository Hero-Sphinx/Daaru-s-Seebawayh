import "server-only";
import { isHarfJarr, parseFreeText, type TokenInput, tokenizeSentence, toSentenceAnalysis } from "@/helpers";
import { badRequest } from "@/server/constants";
import { candidatesFor } from "./candidates";
import { translateSentence } from "./translate";

/** This parser only handles short sentences. */
const MAX_WORDS = 12;

/** FR-1.1 free-text I'rab. Deterministic, rule-based — see freeTextParser.ts's header for scope/limitations. */
export async function parseSentence(text: string, includeTranslation: boolean) {
  const words = tokenizeSentence(text);
  if (words.length === 0) throw badRequest("No words found in that input.");
  if (words.length > MAX_WORDS) throw badRequest(`Keep it to ${MAX_WORDS} words or fewer — this parser only handles short sentences.`);

  // Independent of the deterministic CAMeL analysis — run concurrently
  // rather than adding Gemini's latency on top of it. Translation is
  // best-effort (see translateSentence): it never throws, so it can't turn
  // into an error the way the CAMeL calls below can.
  const [tokenInputs, translationEn] = await Promise.all([
    Promise.all(words.map(async (w): Promise<TokenInput> => ({ surface: w, candidates: isHarfJarr(w) ? [] : await candidatesFor(w) }))),
    includeTranslation ? translateSentence(text) : Promise.resolve(null),
  ]);

  const result = parseFreeText(tokenInputs);
  const sentence = toSentenceAnalysis(result, "Custom sentence");
  if (translationEn) {
    sentence.translationEn = translationEn;
    sentence.translationSource = "gemini";
  }
  return { sentence, warnings: result.warnings, patternMatched: result.patternMatched };
}
