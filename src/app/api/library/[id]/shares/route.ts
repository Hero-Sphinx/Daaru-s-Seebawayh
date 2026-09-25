import { json, readJson, withAuth } from "@/server/lib";
import { shareDocument } from "@/server/services";
import { shareBodySchema } from "@/server/validators/library/validate";

export const POST = withAuth<{ id: string }>(async ({ req, userId, params }) => {
  const { email, role } = await readJson(req, shareBodySchema);
  return json(await shareDocument(userId, params.id, email, role), 201);
});
