import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getApiUserId, unauthorizedResponse } from "@/lib/auth";
import { canAnnotate, getDocumentRole, isUuid } from "@/lib/library/access";
import { MAX_NOTE_LENGTH, resolveAnnotationRange } from "@/lib/library/annotations";

interface CreateBody {
  textUnitId: number;
  start: number;
  end: number;
  note?: string;
  visibility?: "private" | "shared";
}

/** Highlight a passage (optionally with a note). Owner and annotators only. */
export async function POST(request: Request, ctx: RouteContext<"/api/library/[id]/annotations">) {
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = await getDocumentRole(userId, id);
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAnnotate(role)) return NextResponse.json({ error: "You can view this document but not add notes to it" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as CreateBody | null;
  if (!body || !Number.isInteger(body.textUnitId)) return NextResponse.json({ error: "textUnitId is required" }, { status: 400 });
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > MAX_NOTE_LENGTH) return NextResponse.json({ error: `Notes are limited to ${MAX_NOTE_LENGTH} characters` }, { status: 400 });
  const visibility = body.visibility === "private" ? "private" : "shared";

  // The page must belong to this document — never trust the client's pairing.
  const unit = await db.library_text_units.findFirst({ where: { id: BigInt(body.textUnitId), document_id: id } });
  if (!unit) return NextResponse.json({ error: "Page not found in this document" }, { status: 400 });

  const range = resolveAnnotationRange(unit.raw_text, body.start, body.end);
  if (!range.ok) return NextResponse.json({ error: range.error }, { status: 400 });

  const created = await db.library_annotations.create({
    data: {
      document_id: id,
      text_unit_id: unit.id,
      user_id: userId,
      start_offset: range.start,
      end_offset: range.end,
      quote: range.quote,
      note: note || null,
      visibility,
    },
  });
  return NextResponse.json({ id: created.id.toString() }, { status: 201 });
}
