import { json, readJson, withAuth } from "@/server/lib";
import { createAnnotation } from "@/server/services";
import { createAnnotationBodySchema } from "@/server/validators/library/validate";

export const POST = withAuth<{ id: string }>(async ({ req, userId, params }) =>
  json(await createAnnotation(userId, params.id, await readJson(req, createAnnotationBodySchema)), 201)
);
