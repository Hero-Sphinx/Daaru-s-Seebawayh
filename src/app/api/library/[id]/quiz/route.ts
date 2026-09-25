import { json, parseWith, withAuth } from "@/server/lib";
import { generateBookQuiz, getBookQuiz } from "@/server/services";
import { generateQuizBodySchema } from "@/server/validators/library/validate";

/** Generation calls CAMeL per word and Gemini with retries — worst case is genuinely slow. */
export const maxDuration = 300;

export const GET = withAuth<{ id: string }>(async ({ userId, params }) => json({ questions: await getBookQuiz(userId, params.id) }));

/** Builds (once) the cached question bank; `{ regenerate: true }` replaces it. */
export const POST = withAuth<{ id: string }>(async ({ req, userId, params }) => {
  const body = await req.json().catch(() => ({}));
  const { regenerate } = parseWith(generateQuizBodySchema, body ?? {});
  return json(await generateBookQuiz(userId, params.id, regenerate));
});
