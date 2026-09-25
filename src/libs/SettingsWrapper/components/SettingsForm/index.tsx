"use client";

import { useActionState } from "react";
import { updateSrsAlgorithm } from "@/server/actions/settings";
import type { SettingsState } from "@/types/settings";
import { LEITNER_INTERVALS_DAYS } from "@/helpers/srs/leitner";

const OPTIONS = [
  {
    value: "sm2",
    title: "SM-2 (adaptive)",
    body: "Grade each card Again / Hard / Good / Easy. Intervals adapt to how hard each word is for you — hard words come back sooner, easy ones stretch out quickly.",
  },
  {
    value: "leitner",
    title: "Leitner boxes (simple)",
    body: `Just "knew it" or "didn't". Cards move up through 5 boxes, reviewed every ${LEITNER_INTERVALS_DAYS.join(", ")} days; a miss sends a card back to box 1. Predictable and easy to reason about.`,
  },
] as const;

export default function SettingsForm({
  currentAlgorithm,
  boxCounts,
}: {
  currentAlgorithm: "sm2" | "leitner";
  boxCounts: { box: number; count: number }[];
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(updateSrsAlgorithm, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-700/60 dark:bg-parchment-800">
      <div>
        <h2 className="font-semibold">Vocabulary review method</h2>
        <p className="text-xs text-muted">You can switch any time — your progress carries over.</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="sr-only">Review method</legend>
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer gap-3 rounded-md border border-stone-200 p-4 transition has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 dark:border-stone-700 dark:has-[:checked]:bg-emerald-950"
          >
            <input type="radio" name="srsAlgorithm" value={o.value} defaultChecked={currentAlgorithm === o.value} className="mt-1 accent-emerald-700" />
            <span>
              <span className="block text-sm font-medium">{o.title}</span>
              <span className="block text-xs text-muted">{o.body}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {currentAlgorithm === "leitner" && boxCounts.length > 0 && (
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[1, 2, 3, 4, 5].map((box) => (
            <div key={box} className="rounded-lg bg-stone-50 p-2 dark:bg-parchment-900">
              <div className="text-lg font-semibold">{boxCounts.find((b) => b.box === box)?.count ?? 0}</div>
              <div className="text-stone-500">box {box}</div>
            </div>
          ))}
        </div>
      )}

      {state.message && <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</p>}
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
