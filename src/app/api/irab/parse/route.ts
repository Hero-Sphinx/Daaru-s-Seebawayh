import { json, readJson, withAuth } from "@/server/lib";
import { parseSentence } from "@/server/services";
import { parseBodySchema } from "@/server/validators/irab/validate";

export const POST = withAuth(async ({ req }) => {
  const { text, includeTranslation } = await readJson(req, parseBodySchema);
  return json(await parseSentence(text, includeTranslation));
});
