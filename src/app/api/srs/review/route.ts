import { json, readJson, withAuth } from "@/server/lib";
import { reviewCard } from "@/server/services";
import { reviewBodySchema } from "@/server/validators/srs/validate";

export const POST = withAuth(async ({ req, userId }) => {
  const { cardId, quality } = await readJson(req, reviewBodySchema);
  return json(await reviewCard(userId, cardId, quality));
});
