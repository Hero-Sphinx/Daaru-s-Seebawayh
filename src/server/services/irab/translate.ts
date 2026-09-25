import { GeminiNotConfiguredError, generateStructured } from "@/server/helpers";

const TRANSLATE_SCHEMA = {
  type: "object",
  properties: { translationEn: { type: "string" } },
  required: ["translationEn"],
};

/**
 * English translation of a full sentence — not a grammar claim (translation
 * doesn't assert a root, case, or role), so Gemini is within the AI usage
 * policy here the same way it is for vocabulary meaning (see
 * src/server/services/vocabulary/lookupPrompt.ts's header for that same line being drawn).
 * Every caller must label the result AI-generated/unverified — see
 * SentenceAnalysis.translationSource in src/types/irab/index.ts.
 *
 * Best-effort: returns null (never throws) if Gemini isn't configured or
 * the call fails, so a translation being unavailable never blocks the
 * actually-verified I'rab analysis it accompanies.
 */
export async function translateSentence(arabicText: string): Promise<string | null> {
  try {
    const result = await generateStructured<{ translationEn: string }>(
      `Translate this Arabic sentence into natural, idiomatic English. Return only the translation, no notes or alternatives:\n\n${arabicText}`,
      TRANSLATE_SCHEMA
    );
    return result.translationEn?.trim() || null;
  } catch (err) {
    if (!(err instanceof GeminiNotConfiguredError)) {
      console.error("Sentence translation failed:", err);
    }
    return null;
  }
}
