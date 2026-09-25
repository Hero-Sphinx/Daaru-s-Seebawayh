import "server-only";
import type { z } from "zod";
import { canAnnotate, resolveAnnotationRange } from "@/helpers";
import { badRequest, forbidden, notFound } from "@/server/constants";
import { db } from "@/server/databases";
import type { createAnnotationBodySchema, updateAnnotationBodySchema } from "@/server/validators/library/validate";
import { requireDocumentRole } from "./access";

/** Highlight a passage (optionally with a note). Owner and annotators only. */
export async function createAnnotation(userId: string, documentId: string, body: z.infer<typeof createAnnotationBodySchema>) {
  const role = await requireDocumentRole(userId, documentId);
  if (!canAnnotate(role)) throw forbidden("You can read this document but not add notes to it.");

  // The page must belong to this document — never trust the client's pairing.
  const unit = await db.library_text_units.findFirst({ where: { id: BigInt(body.textUnitId), document_id: documentId } });
  if (!unit) throw badRequest("That page isn't part of this document.");

  const range = resolveAnnotationRange(unit.raw_text, body.start, body.end);
  if (!range.ok) throw badRequest(range.error);

  const created = await db.library_annotations.create({
    data: {
      document_id: documentId,
      text_unit_id: unit.id,
      user_id: userId,
      start_offset: range.start,
      end_offset: range.end,
      quote: range.quote,
      note: body.note || null,
      visibility: body.visibility,
    },
  });
  return { id: created.id.toString() };
}

async function loadAnnotation(userId: string, documentId: string, annotationId: string) {
  if (!/^\d+$/.test(annotationId)) throw notFound();
  const role = await requireDocumentRole(userId, documentId);
  const annotation = await db.library_annotations.findFirst({ where: { id: BigInt(annotationId), document_id: documentId } });
  // Someone else's private note is as good as nonexistent to this user.
  if (!annotation || (annotation.visibility === "private" && annotation.user_id !== userId)) throw notFound();
  return { annotation, role };
}

/** Edit your own note's text or visibility. */
export async function updateAnnotation(userId: string, documentId: string, annotationId: string, body: z.infer<typeof updateAnnotationBodySchema>) {
  const { annotation } = await loadAnnotation(userId, documentId, annotationId);
  if (annotation.user_id !== userId) throw forbidden("You can only edit your own notes.");
  await db.library_annotations.update({
    where: { id: annotation.id },
    data: {
      ...(body.note !== undefined ? { note: body.note || null } : {}),
      ...(body.visibility ? { visibility: body.visibility } : {}),
      updated_at: new Date(),
    },
  });
}

/** Delete: the note's author, or the document owner (moderation of their own shared book). */
export async function deleteAnnotation(userId: string, documentId: string, annotationId: string) {
  const { annotation, role } = await loadAnnotation(userId, documentId, annotationId);
  if (annotation.user_id !== userId && role !== "owner") throw forbidden("You can only delete your own notes.");
  await db.library_annotations.delete({ where: { id: annotation.id } });
}
