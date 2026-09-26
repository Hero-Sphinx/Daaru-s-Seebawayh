"use client";

import { useEffect, useRef } from "react";

/** Handlers keyed by KeyboardEvent.key ("ArrowLeft", " ", "1", "Enter", …). */
export type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * Page-level keyboard shortcuts. Ignored while the learner is typing in a
 * field or holding a modifier (so browser shortcuts keep working), and while
 * a button has focus for Space/Enter (they'd press that button instead).
 */
export default function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const ref = useRef(shortcuts);
  useEffect(() => {
    ref.current = shortcuts;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) return;
      const activatesFocused = (event.key === " " || event.key === "Enter") && event.target instanceof HTMLButtonElement;
      if (activatesFocused) return;
      const handler = ref.current[event.key];
      if (!handler) return;
      event.preventDefault();
      handler(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
