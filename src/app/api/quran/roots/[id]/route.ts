import { NextResponse } from "next/server";
import { getRootFamily } from "@/server/services/quran/queries";

// Shared reference data (not per-user), so no DAL check beyond the proxy's
// signed-in gate.
export async function GET(_request: Request, ctx: RouteContext<"/api/quran/roots/[id]">) {
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid root id" }, { status: 400 });
  const family = await getRootFamily(BigInt(id));
  if (!family) return NextResponse.json({ error: "Root not found" }, { status: 404 });
  return NextResponse.json(family);
}
