import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { getDocumentRole, isUuid } from "@/server/services/library/access";
import { MAX_NOTE_LENGTH } from "@/helpers/library/annotations";

type Ctx = RouteContext<"/api/library/[id]/annotations/[annotationId]">;

async function load(ctx: Ctx, userId: string) {
  const { id, annotationId } = await ctx.params;
  if (!isUuid(id) || !/^\d+$/.test(annotationId)) return null;
  const role = await getDocumentRole(userId, id);
  if (!role) return null;
  const annotation = await db.library_annotations.findFirst({ where: { id: BigInt(annotationId), document_id: id } });
  // Someone else's private note is as good as nonexistent to this user.
  if (!annotation || (annotation.visibility === "private" && annotation.user_id !== userId)) return null;
  return { annotation, role };
}

/** Edit your own note's text or visibility. */
export async function PATCH(request: Request, ctx: Ctx) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();
  const found = await load(ctx, userId);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (found.annotation.user_id !== userId) return NextResponse.json({ error: "You can only edit your own notes" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { note?: string; visibility?: string };
  const note = typeof body.note === "string" ? body.note.trim() : undefined;
  if (note !== undefined && note.length > MAX_NOTE_LENGTH) {
    return NextResponse.json({ error: `Notes are limited to ${MAX_NOTE_LENGTH} characters` }, { status: 400 });
  }
  const visibility = body.visibility === "private" || body.visibility === "shared" ? body.visibility : undefined;

  await db.library_annotations.update({
    where: { id: found.annotation.id },
    data: { ...(note !== undefined ? { note: note || null } : {}), ...(visibility ? { visibility } : {}), updated_at: new Date() },
  });
  return NextResponse.json({ ok: true });
}

/** Delete: the note's author, or the document owner (moderation of their own shared book). */
export async function DELETE(_request: Request, ctx: Ctx) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();
  const found = await load(ctx, userId);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (found.annotation.user_id !== userId && found.role !== "owner") {
    return NextResponse.json({ error: "You can only delete your own notes" }, { status: 403 });
  }
  await db.library_annotations.delete({ where: { id: found.annotation.id } });
  return NextResponse.json({ ok: true });
}
