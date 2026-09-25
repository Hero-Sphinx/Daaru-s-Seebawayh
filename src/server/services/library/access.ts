import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { forbidden, notFound } from "@/server/constants";
import { db } from "@/server/databases";
import type { DocumentRole } from "@/types";

/**
 * Library document access rules (see DocumentRole in src/types/library), in
 * one place so every page, route and raw query applies the same ones.
 */

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

/** The document if this user may see it (owner or shared), else null — also for a malformed id. */
export async function findAccessibleDocument(userId: string, documentId: string) {
  if (!isUuid(documentId)) return null;
  return db.library_documents.findFirst({ where: { id: documentId, ...accessibleDocumentsWhere(userId) } });
}

/** The user's role on one document, or null if they can't see it at all (treat as 404, not 403). */
export async function getDocumentRole(userId: string, documentId: string): Promise<DocumentRole | null> {
  if (!isUuid(documentId)) return null;
  const doc = await db.library_documents.findUnique({
    where: { id: documentId },
    select: { owner_user_id: true, library_document_shares: { where: { user_id: userId }, select: { role: true } } },
  });
  if (!doc) return null;
  if (doc.owner_user_id === userId) return "owner";
  const role = doc.library_document_shares[0]?.role;
  return role === "annotator" || role === "viewer" ? role : null;
}

/** The user's role, or a 404 when they can't see the document at all. */
export async function requireDocumentRole(userId: string, documentId: string): Promise<DocumentRole> {
  const role = await getDocumentRole(userId, documentId);
  if (!role) throw notFound();
  return role;
}

/** 404 when the user can't see the document, 403 when they can but don't own it. */
export async function requireOwner(userId: string, documentId: string, action: string): Promise<void> {
  if ((await requireDocumentRole(userId, documentId)) !== "owner") throw forbidden(`Only the owner can ${action}.`);
}

/** UUID shape check before hitting Postgres (an invalid uuid literal is a 500, not a 404). */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
