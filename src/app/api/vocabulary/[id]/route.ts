import { noContent, parseWith, withAuth } from "@/server/lib";
import { deleteVocabulary } from "@/server/services";
import { vocabularyIdSchema } from "@/server/validators/vocabulary/validate";

export const DELETE = withAuth<{ id: string }>(async ({ userId, params }) => {
  await deleteVocabulary(userId, parseWith(vocabularyIdSchema, params.id));
  return noContent();
});
