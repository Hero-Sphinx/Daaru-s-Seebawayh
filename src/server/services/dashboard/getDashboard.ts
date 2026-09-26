import "server-only";
import { cookies } from "next/headers";
import { TIMEZONE_COOKIE, wisdomIndexForDate } from "@/constants";
import { daysAgo, realName } from "@/helpers";
import { db } from "@/server/databases";
import type { DashboardData } from "@/types";
import { accessibleDocumentsWhere } from "../library/access";

const MASTERED_REPETITIONS_THRESHOLD = 2;

/** The browser's time zone (set by the client in a cookie), falling back to UTC. */
async function learnerTimeZone(): Promise<string> {
  const raw = (await cookies()).get(TIMEZONE_COOKIE)?.value;
  if (!raw) return "UTC";
  try {
    const tz = decodeURIComponent(raw);
    // Throws RangeError on anything that isn't a real IANA zone.
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const weekAgo = daysAgo(7);
  // Same rule as the Library page: documents the learner owns or has been shared.
  const myDocuments = accessibleDocumentsWhere(userId);
  const [cardsDueToday, wordsMastered, totalAttempts7d, correctAttempts7d, documentsInLibrary, recentDocuments, recentFawaid, me, timeZone] =
    await Promise.all([
      db.srs_cards.count({ where: { user_id: userId, due_at: { lte: new Date() } } }),
      db.srs_cards.count({ where: { user_id: userId, repetitions: { gte: MASTERED_REPETITIONS_THRESHOLD } } }),
      db.quiz_attempts.count({ where: { user_id: userId, answered_at: { gte: weekAgo } } }),
      db.quiz_attempts.count({ where: { user_id: userId, answered_at: { gte: weekAgo }, is_correct: true } }),
      db.library_documents.count({ where: myDocuments }),
      db.library_documents.findMany({
        where: myDocuments,
        orderBy: { uploaded_at: "desc" },
        take: 5,
        select: { id: true, title: true, processing_status: true },
      }),
      db.fawaid.findMany({
        where: { library_text_units: { library_documents: myDocuments } },
        orderBy: { created_at: "desc" },
        take: 5,
        select: { id: true, title: true, category: true },
      }),
      db.users.findUnique({ where: { id: userId }, select: { display_name: true } }),
      learnerTimeZone(),
    ]);

  return {
    name: realName(me?.display_name),
    cardsDueToday,
    wordsMastered,
    quizAccuracyLabel: totalAttempts7d > 0 ? `${Math.round((correctAttempts7d / totalAttempts7d) * 100)}%` : "—",
    documentsInLibrary,
    recentDocuments,
    recentFawaid,
    wisdomIndex: wisdomIndexForDate(new Date(), timeZone),
    timeZone,
  };
}
