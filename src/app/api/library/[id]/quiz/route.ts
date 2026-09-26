import { json, readOptionalJson, withAuth } from "@/server/lib";
import { generateBookQuiz, getBookQuiz } from "@/server/services";
import { generateQuizBodySchema } from "@/server/validators/library/validate";

/** Generation calls CAMeL per word and Gemini with retries — worst case is genuinely slow. */
export const maxDuration = 300;

export const GET = withAuth<{ id: string }>(async ({ userId, params }) => json({ questions: await getBookQuiz(userId, params.id) }));

/** Builds (once) the cached question bank; `{ regenerate: true }` replaces it. An empty body means "build". */
export const POST = withAuth<{ id: string }>(async ({ req, userId, params }) => {
  const { regenerate } = await readOptionalJson(req, generateQuizBodySchema);
  return json(await generateBookQuiz(userId, params.id, regenerate));
});
