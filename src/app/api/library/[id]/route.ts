import { json, noContent, withAuth } from "@/server/lib";
import { deleteDocument, getDocument } from "@/server/services";

export const GET = withAuth<{ id: string }>(async ({ userId, params }) => json(await getDocument(userId, params.id)));

export const DELETE = withAuth<{ id: string }>(async ({ userId, params }) => {
  await deleteDocument(userId, params.id);
  return noContent();
});
