import "server-only";
import { badRequest, forbidden, notFound } from "@/server/constants";
import { db } from "@/server/databases";
import { requireDocumentRole, requireOwner } from "./access";

/**
 * Share a document with another account by email (owner only). Re-sharing
 * with the same person updates their role. There are no email invitations —
 * the person needs an account already.
 */
export async function shareDocument(userId: string, documentId: string, email: string, role: "viewer" | "annotator") {
  await requireOwner(userId, documentId, "share this document");

  const target = await db.users.findUnique({ where: { email }, select: { id: true, display_name: true, email: true } });
  if (!target) throw notFound("No account uses that email — ask them to sign up first, then share again.");
  if (target.id === userId) throw badRequest("You already own this document.");

  await db.library_document_shares.upsert({
    where: { document_id_user_id: { document_id: documentId, user_id: target.id } },
    update: { role },
    create: { document_id: documentId, user_id: target.id, role },
  });
  return { userId: target.id, name: target.display_name ?? target.email, role };
}

/**
 * Remove someone's access: the owner can revoke anyone; a shared user can
 * remove themselves ("leave"). Their notes on the document are kept for
 * everyone who still has access — they're part of the book's discussion.
 */
export async function removeShare(userId: string, documentId: string, targetUserId: string): Promise<void> {
  const role = await requireDocumentRole(userId, documentId);
  if (role !== "owner" && targetUserId !== userId) throw forbidden("Only the owner can remove other people.");
  const result = await db.library_document_shares.deleteMany({ where: { document_id: documentId, user_id: targetUserId } });
  if (result.count === 0) throw notFound("That person doesn't have access.");
}
