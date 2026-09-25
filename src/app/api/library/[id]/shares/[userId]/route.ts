import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { getDocumentRole, isUuid } from "@/server/services/library/access";

/**
 * Remove someone's access: the owner can revoke anyone; a shared user can
 * remove themselves ("leave"). Their notes on the document are kept for
 * everyone who still has access — they're part of the book's discussion.
 */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/library/[id]/shares/[userId]">) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();
  const { id, userId: targetUserId } = await ctx.params;
  if (!isUuid(id) || !isUuid(targetUserId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getDocumentRole(userId, id);
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "owner" && targetUserId !== userId) {
    return NextResponse.json({ error: "Only the owner can remove other people" }, { status: 403 });
  }

  const result = await db.library_document_shares.deleteMany({ where: { document_id: id, user_id: targetUserId } });
  if (result.count === 0) return NextResponse.json({ error: "Not shared with that person" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
