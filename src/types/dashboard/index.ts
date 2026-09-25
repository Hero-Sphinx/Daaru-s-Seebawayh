export interface DashboardData {
  /** A name worth greeting the learner by, or null. */
  name: string | null;
  cardsDueToday: number;
  wordsMastered: number;
  /** "82%", or "—" before any attempt in the last 7 days. */
  quizAccuracyLabel: string;
  documentsInLibrary: number;
  recentDocuments: { id: string; title: string; processing_status: string }[];
  recentFawaid: { id: bigint; title: string; category: string }[];
  /** Wisdom-of-the-day entry for the learner's own date. */
  wisdomIndex: number;
  timeZone: string;
}
