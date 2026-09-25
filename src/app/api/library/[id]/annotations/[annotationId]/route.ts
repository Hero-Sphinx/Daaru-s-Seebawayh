import { json, readJson, withAuth } from "@/server/lib";
import { deleteAnnotation, updateAnnotation } from "@/server/services";
import { updateAnnotationBodySchema } from "@/server/validators/library/validate";

type Params = { id: string; annotationId: string };

export const PATCH = withAuth<Params>(async ({ req, userId, params }) => {
  await updateAnnotation(userId, params.id, params.annotationId, await readJson(req, updateAnnotationBodySchema));
  return json({ ok: true });
});

export const DELETE = withAuth<Params>(async ({ userId, params }) => {
  await deleteAnnotation(userId, params.id, params.annotationId);
  return json({ ok: true });
});
