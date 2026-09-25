import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getApiUserId, unauthorizedResponse } from "@/lib/auth";
import { accessibleDocumentsWhere, isUuid } from "@/lib/library/access";
import { toLibraryDocumentDTO, type LibraryDocumentRow } from "@/lib/library";

export async function GET(_request: Request, ctx: RouteContext<"/api/library/[id]">) {
  const { id } = await ctx.params;
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const document = isUuid(id) ? await db.library_documents.findFirst({ where: { id, ...accessibleDocumentsWhere(userId) } }) : null;
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const textUnits = await db.library_text_units.findMany({
    where: { document_id: id },
    orderBy: { sequence_in_doc: "asc" },
    include: { fawaid: true },
  });

  return NextResponse.json({
    document: toLibraryDocumentDTO(document as unknown as LibraryDocumentRow),
    pages: textUnits.map((u) => ({ id: Number(u.id), pageNumber: u.page_number, text: u.raw_text })),
    fawaid: textUnits.flatMap((u) =>
      u.fawaid.map((f) => ({
        id: Number(f.id),
        pageNumber: u.page_number,
        category: f.category,
        title: f.title,
        bodyEn: f.body_en,
        bodyAr: f.body_ar,
      }))
    ),
  });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/library/[id]">) {
  const { id } = await ctx.params;
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  // Owner only — deleting also removes it for everyone it's shared with.
  const result = isUuid(id) ? await db.library_documents.deleteMany({ where: { id, owner_user_id: userId } }) : { count: 0 };
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
