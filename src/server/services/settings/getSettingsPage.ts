import "server-only";
import { db } from "@/server/databases";
import type { SettingsPageData } from "@/types";

export async function getSettingsPage(userId: string): Promise<SettingsPageData> {
  const [user, boxCounts] = await Promise.all([
    db.users.findUniqueOrThrow({ where: { id: userId }, select: { email: true, display_name: true, srs_algorithm: true } }),
    db.srs_cards.groupBy({ by: ["leitner_box"], where: { user_id: userId }, _count: { _all: true }, orderBy: { leitner_box: "asc" } }),
  ]);
  return { user, boxCounts: boxCounts.map((b) => ({ box: b.leitner_box, count: b._count._all })) };
}
