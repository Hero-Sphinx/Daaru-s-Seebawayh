import { notFound } from "@/server/constants";
import { json, withAuth } from "@/server/lib";
import { isUuid, removeShare } from "@/server/services";

export const DELETE = withAuth<{ id: string; userId: string }>(async ({ userId, params }) => {
  if (!isUuid(params.userId)) throw notFound();
  await removeShare(userId, params.id, params.userId);
  return json({ ok: true });
});
