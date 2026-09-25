import { json, readJson, withAuth } from "@/server/lib";
import { buildQuizSession } from "@/server/services";
import { sessionBodySchema } from "@/server/validators/quiz/validate";

export const POST = withAuth(async ({ req, userId }) => json(await buildQuizSession(userId, await readJson(req, sessionBodySchema))));
