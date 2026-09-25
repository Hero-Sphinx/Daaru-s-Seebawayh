import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getApiUserId, unauthorizedResponse } from "@/lib/auth";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/vocabulary/[id]">) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const userId = await getApiUserId();
  if (!userId) return unauthorizedResponse();

  const result = await db.vocabulary_items.deleteMany({
    where: { id: BigInt(id), user_id: userId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
