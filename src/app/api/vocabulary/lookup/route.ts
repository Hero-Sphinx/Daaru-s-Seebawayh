import { json, readJson, withAuth } from "@/server/lib";
import { lookupWord } from "@/server/services";
import { lookupBodySchema } from "@/server/validators/vocabulary/validate";

/** Word lookup for vocabulary entry and the Library reader — see lookupWord(). */
export const POST = withAuth(async ({ req }) => {
  const { input, withMeaning } = await readJson(req, lookupBodySchema);
  return json(await lookupWord(input, withMeaning !== false));
});
