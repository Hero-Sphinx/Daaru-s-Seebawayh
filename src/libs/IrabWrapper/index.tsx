"use client";

import { useState } from "react";
import type { SentenceAnalysis } from "@/types/irab";
import IrabWorkspace from "@/libs/IrabWrapper/components/IrabWorkspace";
import IrabCheatSheet from "@/libs/IrabWrapper/components/IrabCheatSheet";
import FreeTextIrabInput from "@/libs/IrabWrapper/components/FreeTextIrabInput";
import IrabReconstruction from "@/libs/IrabWrapper/components/IrabReconstruction";
import { BookIcon, CheckIcon, DiagramIcon, LightbulbIcon } from "@/components/Icons";
import PageBanner from "@/layouts/PageBanner";

const MODES: { id: Mode; label: string; hint: string; icon: typeof BookIcon }[] = [
  { id: "curated", label: "Curated examples", hint: "Explore analysed sentences", icon: BookIcon },
  { id: "custom", label: "Type your own sentence", hint: "Any fully vowelled sentence", icon: DiagramIcon },
  { id: "practice", label: "Build it yourself", hint: "You give the i'rab, we check it", icon: CheckIcon },
];

type Mode = "curated" | "custom" | "practice";

export default function IrabWrapper({ sentences }: { sentences: SentenceAnalysis[] }) {
  const [mode, setMode] = useState<Mode>("curated");
  const [selectedId, setSelectedId] = useState(sentences[0]?.id);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const sentence = sentences.find((s) => s.id === selectedId) ?? sentences[0];

  return (
    <div className="space-y-6">
      <PageBanner
        tone="amber"
        icon={DiagramIcon}
        titleAr="الإِعْرَابُ"
        title="I'rab Workspace"
        description="Every word's role, case and sign — the way the books say it. Tap a word to see it across the sentence, its card, and the tree."
      >
        <button
          onClick={() => setShowCheatSheet((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white/80 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 dark:border-amber-800 dark:bg-parchment-900/60 dark:text-amber-300"
        >
          <LightbulbIcon className="h-4 w-4" /> {showCheatSheet ? "Hide" : "Show"} rules & cheat sheet
        </button>
      </PageBanner>

      {showCheatSheet && <IrabCheatSheet onClose={() => setShowCheatSheet(false)} />}

      <div role="tablist" aria-label="Mode" className="grid gap-2 sm:grid-cols-3">
        {MODES.map(({ id, label, hint, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setMode(id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-sm"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-white/20" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className={`block text-xs ${active ? "text-emerald-50" : "text-muted"}`}>{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {mode === "curated" ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="irab-sentence-select" className="block text-xs font-semibold text-muted">
              Select a practice sentence:
            </label>
            <select
              id="irab-sentence-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-4 py-2.5 font-arabic text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-stone-600 dark:bg-parchment-900 sm:max-w-md"
            >
              {sentences.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sourceLabel}
                </option>
              ))}
            </select>
            {sentence.translationEn && <p className="text-sm italic text-muted">{sentence.translationEn}</p>}
          </div>

          <IrabWorkspace sentence={sentence} />
        </div>
      ) : mode === "practice" ? (
        <IrabReconstruction sentences={sentences} />
      ) : (
        <FreeTextIrabInput />
      )}
    </div>
  );
}
