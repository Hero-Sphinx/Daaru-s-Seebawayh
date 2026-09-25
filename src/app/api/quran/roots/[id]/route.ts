import { badRequest, notFound } from "@/server/constants";
import { json, withAuth } from "@/server/lib";
import { getRootFamily } from "@/server/services";

/** Every Qur'anic word built on one root. Shared reference data, not per-user. */
export const GET = withAuth<{ id: string }>(async ({ params }) => {
  if (!/^\d+$/.test(params.id)) throw badRequest("Invalid root id");
  const family = await getRootFamily(BigInt(params.id));
  if (!family) throw notFound("Root not found");
  return json(family);
});
