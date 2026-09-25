import { NextResponse } from "next/server";
import db from "@/server/databases/db";
import { getApiUserId, unauthorizedResponse } from "@/server/lib/auth";
import { getDocumentRole, isUuid } from "@/server/services/library/access";

/**
 * Share a document with another account by email (owner only). Re-sharing
 * with the same person updates their role. There are no email invitations —
 * the person needs an account already (no email provider is configured).
 */
export async function POST(request: Request, ctx: RouteContext<"/api/library/[id]/shares">) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getDocumentRole(userId, id);
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (role !== "owner") return NextResponse.json({ error: "Only the owner can share this document" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { email?: string; role?: string };
  const email = body.email?.trim().toLowerCase();
  const shareRole = body.role === "annotator" ? "annotator" : body.role === "viewer" ? "viewer" : null;
  if (!email || !shareRole) return NextResponse.json({ error: "email and role (viewer | annotator) are required" }, { status: 400 });

  const target = await db.users.findUnique({ where: { email }, select: { id: true, display_name: true, email: true } });
  if (!target) {
    return NextResponse.json({ error: "No account uses that email — ask them to sign up first, then share again." }, { status: 404 });
  }
  if (target.id === userId) return NextResponse.json({ error: "You already own this document" }, { status: 400 });

  await db.library_document_shares.upsert({
    where: { document_id_user_id: { document_id: id, user_id: target.id } },
    update: { role: shareRole },
    create: { document_id: id, user_id: target.id, role: shareRole },
  });
  return NextResponse.json({ userId: target.id, name: target.display_name ?? target.email, role: shareRole }, { status: 201 });
}
