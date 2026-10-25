"use client";

import { useCallback, useSyncExternalStore } from "react";

export type LanguageChoice = "both" | "ar" | "en";

// Per-device preferences (a convenience, not data): kept in localStorage and
// read through useSyncExternalStore, so the server render and the first client
// render agree on "both" and every component using the same key stays in step.
const listeners = new Map<string, Set<() => void>>();

function read(key: string): LanguageChoice {
  try {
    const v = localStorage.getItem(key);
    return v === "ar" || v === "en" ? v : "both";
  } catch {
    return "both";
  }
}

function write(key: string, choice: LanguageChoice) {
  try {
    if (choice === "both") localStorage.removeItem(key);
    else localStorage.setItem(key, choice);
  } catch {
    // Storage blocked (private mode) — the choice just won't be remembered.
  }
  listeners.get(key)?.forEach((l) => l());
}

/** Arabic, English or both — remembered on this device under `key`. */
export function useLanguageChoice(key: string): [LanguageChoice, (choice: LanguageChoice) => void] {
  const subscribe = useCallback(
    (listener: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(listener);
      listeners.set(key, set);
      return () => set.delete(listener);
    },
    [key]
  );
  const choice = useSyncExternalStore(subscribe, () => read(key), () => "both" as const);
  const setChoice = useCallback((c: LanguageChoice) => write(key, c), [key]);
  return [choice, setChoice];
}
