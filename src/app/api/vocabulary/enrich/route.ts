import { analyzeWord } from "@/server/helpers";
import { json, readJson, withAuth } from "@/server/lib";
import { enrichBodySchema } from "@/server/validators/vocabulary/validate";

/**
 * FR-4.2 morphological enrichment. Deterministic — see README.md's AI usage
 * policy. Fails soft: if the CAMeL service isn't running, this is the only
 * thing that breaks (the "Auto-fill" button), not vocabulary entry itself.
 */
export const POST = withAuth(async ({ req }) => {
  const { word } = await readJson(req, enrichBodySchema);
  return json({ word, candidates: await analyzeWord(word) });
});
