import db from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

/**
 * Library document access rules (ROADMAP.md Phase 5 sharing), in one place
 * so every page, route and raw query applies the same ones:
 *
 *   owner      — library_documents.owner_user_id; everything incl. delete/share
 *   annotator  — shared with role 'annotator'; read + add own notes
 *   viewer     — shared with role 'viewer'; read + see shared notes
 */

export type DocumentRole = "owner" | "annotator" | "viewer";

/** Prisma filter: documents the user owns or has been shared. */
export function accessibleDocumentsWhere(userId: string) {
  return {
    OR: [{ owner_user_id: userId }, { library_document_shares: { some: { user_id: userId } } }],
  } satisfies Prisma.library_documentsWhereInput;
}

/** Same rule as a raw-SQL predicate on a library_documents alias `d`. */
export function accessibleDocumentsSql(userId: string): Prisma.Sql {
  return Prisma.sql`(d.owner_user_id = ${userId}::uuid OR EXISTS (
    SELECT 1 FROM library_document_shares s WHERE s.document_id = d.id AND s.user_id = ${userId}::uuid))`;
}

/** The user's role on one document, or null if they can't see it at all (treat as 404, not 403). */
export async function getDocumentRole(userId: string, documentId: string): Promise<DocumentRole | null> {
  const doc = await db.library_documents.findUnique({
    where: { id: documentId },
    select: { owner_user_id: true, library_document_shares: { where: { user_id: userId }, select: { role: true } } },
  });
  if (!doc) return null;
  if (doc.owner_user_id === userId) return "owner";
  const role = doc.library_document_shares[0]?.role;
  return role === "annotator" || role === "viewer" ? role : null;
}

export function canAnnotate(role: DocumentRole | null): boolean {
  return role === "owner" || role === "annotator";
}

/** UUID shape check before hitting Postgres (an invalid uuid literal is a 500, not a 404). */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
