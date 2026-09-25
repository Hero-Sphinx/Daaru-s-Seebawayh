import { json, parseWith, withAuth } from "@/server/lib";
import { searchRoot, searchText } from "@/server/services";
import { searchQuerySchema } from "@/server/validators/library/validate";

export const GET = withAuth(async ({ req, userId }) => {
  const params = new URL(req.url).searchParams;
  const { q, mode } = parseWith(searchQuerySchema, { q: params.get("q") ?? undefined, mode: params.get("mode") ?? undefined });
  return json(mode === "root" ? await searchRoot(userId, q) : await searchText(userId, q));
});
