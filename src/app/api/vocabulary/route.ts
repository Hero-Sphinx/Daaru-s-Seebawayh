import { json, readJson, withAuth } from "@/server/lib";
import { createVocabulary, listVocabulary } from "@/server/services";
import { createVocabularyBodySchema } from "@/server/validators/vocabulary/validate";

export const GET = withAuth(async ({ userId }) => json(await listVocabulary(userId)));

export const POST = withAuth(async ({ req, userId }) => {
  const { items } = await readJson(req, createVocabularyBodySchema);
  return json(await createVocabulary(userId, items), 201);
});
