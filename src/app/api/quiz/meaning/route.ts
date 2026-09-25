import { json, readJson, withAuth } from "@/server/lib";
import { generateAiMeaningQuestions } from "@/server/services";
import { meaningBodySchema } from "@/server/validators/quiz/validate";

/**
 * FR-4.x Quiz Center "meaning" topic — Gemini-generated sentence+
 * translation pairs, fresh each request rather than capped at the curated
 * sampleSentences.ts bank. See generateMeaningAi.ts's header for the AI
 * usage policy line this stays within. Returns an empty list on failure —
 * this is a variety boost the client falls back from, not something that
 * should surface as an error to the learner.
 */
export const POST = withAuth(async ({ req }) => {
  const { count } = await readJson(req, meaningBodySchema);
  return json({ questions: await generateAiMeaningQuestions(count, Math.random) });
});
