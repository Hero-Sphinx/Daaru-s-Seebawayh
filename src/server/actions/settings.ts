"use server";

import { revalidatePath } from "next/cache";
import db from "@/server/databases/db";
import { getCurrentUserId } from "@/server/lib/auth";
import { LEITNER_INTERVALS_DAYS } from "@/helpers/srs/leitner";
import type { SettingsState } from "@/types/settings";

/** The name used on the dashboard and in emails. Empty clears it. */
export async function updateDisplayName(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const userId = await getCurrentUserId();
  const raw = formData.get("displayName");
  const name = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (name.length > 60) return { error: "Please keep your name under 60 characters." };
  await db.users.update({ where: { id: userId }, data: { display_name: name || null } });
  revalidatePath("/", "layout");
  return { message: name ? `Saved — we'll call you ${name}.` : "Name cleared." };
}

export async function updateSrsAlgorithm(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const userId = await getCurrentUserId();
  const algorithm = formData.get("srsAlgorithm");
  if (algorithm !== "sm2" && algorithm !== "leitner") return { error: "Choose SM-2 or Leitner." };

  const user = await db.users.findUniqueOrThrow({ where: { id: userId }, select: { srs_algorithm: true } });
  if (user.srs_algorithm === algorithm) return { message: "No change — that's already your review method." };

  if (algorithm === "leitner") {
    // Place every card in the box matching its current SM-2 interval
    // (same rule as boxForInterval), so known words aren't reset to box 1.
    // One updateMany per box, derived from the interval table itself.
    const boxUpdates = LEITNER_INTERVALS_DAYS.map((days, i) => {
      const nextDays = LEITNER_INTERVALS_DAYS[i + 1];
      return db.srs_cards.updateMany({
        where: {
          user_id: userId,
          interval_days: i === 0 ? { lt: nextDays } : nextDays === undefined ? { gte: days } : { gte: days, lt: nextDays },
        },
        data: { leitner_box: i + 1 },
      });
    });
    await db.$transaction([...boxUpdates, db.users.update({ where: { id: userId }, data: { srs_algorithm: "leitner" } })]);
  } else {
    // SM-2 state was kept in step during Leitner reviews — nothing to convert.
    await db.users.update({ where: { id: userId }, data: { srs_algorithm: "sm2" } });
  }

  revalidatePath("/vocabulary");
  revalidatePath("/settings");
  return {
    message:
      algorithm === "leitner"
        ? "Switched to Leitner boxes — your cards were placed in boxes based on how well you already know them."
        : "Switched to SM-2 — your cards keep their current schedule.",
  };
}
