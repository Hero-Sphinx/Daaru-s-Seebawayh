import Link from "next/link";
import { dashboardStats, recentDocuments, recentFawaid } from "@/lib/data/mock-dashboard";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-neutral-500">Here&apos;s where you left off.</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Cards due today" value={String(dashboardStats.cardsDueToday)} />
        <StatCard label="Documents in library" value={String(dashboardStats.documentsInLibrary)} />
        <StatCard label="Quiz accuracy (7d)" value={`${Math.round(dashboardStats.quizAccuracy7d * 100)}%`} />
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Continue learning</h2>
            <Link href="/vocabulary" className="text-sm text-sky-600 hover:underline">
              Review now →
            </Link>
          </div>
          <p className="text-sm text-neutral-500">
            {dashboardStats.cardsDueToday} vocabulary cards are due for spaced-repetition review.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Library</h2>
            <Link href="/library" className="text-sm text-sky-600 hover:underline">
              Open library →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between">
                <span>{doc.title}</span>
                <span
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    doc.processingStatus === "completed"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                  }`}
                >
                  {doc.processingStatus}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h2 className="mb-3 font-medium">Recent Fawā&apos;id</h2>
        <ul className="space-y-2 text-sm">
          {recentFawaid.map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              <span className="text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-neutral-500">
                {f.category}
              </span>
              <span dir="rtl" className="font-arabic">
                {f.title}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
