"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "@/components/icons";

/**
 * Details for something the user tapped (a Qur'an word, a word in a book):
 * on phones a sheet that slides up from the bottom of the screen — so the
 * result appears where the user is looking, not far below the text — and on
 * large screens just its children, in place (the side column).
 */
export default function MobileSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  // Esc closes it; the page behind doesn't scroll while it's open on a phone.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const small = window.matchMedia("(max-width: 1023px)").matches;
    const prevOverflow = document.body.style.overflow;
    if (small) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      {open && <button type="button" aria-label="Close details" onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden" />}
      <div
        role={open ? "dialog" : undefined}
        aria-label={title}
        className={`${
          open ? "translate-y-0" : "pointer-events-none translate-y-full"
        } fixed inset-x-0 bottom-0 z-50 max-h-[78vh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-border bg-background pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-300 ease-out lg:pointer-events-auto lg:static lg:z-auto lg:max-h-none lg:translate-y-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:pb-0 lg:shadow-none lg:transition-none`}
      >
        {/* Handle + close, phones only */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 pb-2 pt-3 backdrop-blur lg:hidden">
          <span className="mx-auto h-1.5 w-12 rounded-full bg-border" aria-hidden />
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-2 rounded-full p-2 text-muted hover:bg-surface hover:text-foreground">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-3 lg:px-0">{children}</div>
      </div>
    </>
  );
}
