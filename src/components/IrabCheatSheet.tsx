import { XIcon } from "@/components/icons";

/**
 * Static reference content — the three pillars of I'rab analysis, each
 * example cross-checked against Al-Ajurrumiyyah. Kept as plain data next to
 * the component so it's easy to audit for accuracy in review.
 */
const RULE_COLUMNS = [
  {
    title: "1. Al-Mawqi' (المَوْقِع) — Position",
    accent: "text-emerald-700 dark:text-emerald-400",
    rows: [
      { ar: "فَاعِلٌ", en: "Doer of the action (nominative)" },
      { ar: "مَفْعُولٌ بِهِ", en: "Object of the action" },
      { ar: "مُبْتَدَأٌ / خَبَرٌ", en: "Topic & predicate" },
      { ar: "اِسْمٌ مَجْرُورٌ", en: "Noun after a preposition" },
    ],
  },
  {
    title: "2. Al-Halah (الحَالَة) — Case",
    accent: "text-amber-700 dark:text-amber-400",
    rows: [
      { ar: "مَرْفُوعٌ", en: "Nominative — default subject state" },
      { ar: "مَنْصُوبٌ", en: "Accusative — objects / adverbials" },
      { ar: "مَجْرُورٌ", en: "Genitive — possessive / after prepositions" },
      { ar: "مَجْزُومٌ", en: "Jussive — verbs after lā / lam" },
    ],
  },
  {
    title: "3. Al-'Alamah (العَلَامَة) — Sign",
    accent: "text-teal-700 dark:text-teal-400",
    rows: [
      { ar: "الضَّمَّةُ", en: "Primary sign of raf'" },
      { ar: "الْفَتْحَةُ", en: "Primary sign of nasb" },
      { ar: "الْكَسْرَةُ", en: "Primary sign of jarr" },
      { ar: "السُّكُونُ", en: "Sign of jazm on sound verbs" },
    ],
  },
];

export default function IrabCheatSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4 rounded-lg border border-amber-300/50 bg-stone-50 p-6 dark:border-amber-700/50 dark:bg-parchment-800/90">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-amber-800 dark:text-amber-300">Fundamental rules of I&apos;rab</h3>
        <button onClick={onClose} aria-label="Close cheat sheet" className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
        {RULE_COLUMNS.map((col) => (
          <div key={col.title} className="rounded-md border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-parchment-900">
            <h4 className={`mb-2 border-b border-stone-200 pb-1 font-bold dark:border-stone-700 ${col.accent}`}>{col.title}</h4>
            <ul className="space-y-1.5 text-muted">
              {col.rows.map((row) => (
                <li key={row.ar}>
                  <span dir="rtl" className="font-arabic text-sm font-semibold">
                    {row.ar}:
                  </span>{" "}
                  {row.en}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
