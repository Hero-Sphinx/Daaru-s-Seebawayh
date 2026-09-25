import { json, readJson, withAuth } from "@/server/lib";
import { recordAttempt } from "@/server/services";
import { attemptBodySchema } from "@/server/validators/quiz/validate";

export const POST = withAuth(async ({ req, userId }) => {
  await recordAttempt(userId, await readJson(req, attemptBodySchema));
  return json({ ok: true }, 201);
});
