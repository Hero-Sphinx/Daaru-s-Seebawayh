"use client";

import { useEffect, useSyncExternalStore } from "react";
import { setPrefCookie, TIMEZONE_COOKIE, WISDOM, type Wisdom, wisdomIndexForDate } from "@/constants";

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

// Nothing to subscribe to: the value only changes at midnight, and a reload picks that up.
const noSubscription = () => () => {};

const KIND_LABEL: Record<Wisdom["kind"], string> = {
  nahw: "Naḥw",
  poetry: "Poetry",
  saying: "Saying",
  quran: "Qurʾān",
  hadith: "Ḥadīth",
};

const ATTRIBUTION_NOTE: Record<Wisdom["attribution"], string | null> = {
  established: null,
  attributed: "Attributed",
  reported: "Reported",
};

/**
 * Today's entry, by the *user's* calendar date: the server renders it for the
 * time zone the browser reported last time (TIMEZONE_COOKIE), and the browser
 * uses its own zone from then on — so it changes at the user's midnight, and
 * a first visit or a trip abroad is corrected immediately.
 */
export default function WisdomCard({ index, serverTimeZone }: { index: number; serverTimeZone: string }) {
  const today = useSyncExternalStore(noSubscription, () => wisdomIndexForDate(new Date(), browserTimeZone()), () => index);
  useEffect(() => {
    const tz = browserTimeZone();
    if (tz !== serverTimeZone) setPrefCookie(TIMEZONE_COOKIE, tz);
  }, [serverTimeZone]);
  const w = WISDOM[today];
  const note = ATTRIBUTION_NOTE[w.attribution];

  return (
    <section aria-labelledby="wisdom-heading" className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800/40 dark:bg-parchment-800/80">
      <div className="flex items-center justify-between border-b border-amber-200/80 px-5 py-3 dark:border-amber-800/40">
        <h2 id="wisdom-heading" className="text-sm font-semibold text-foreground">
          Wisdom of the day <span className="font-arabic font-normal text-muted">· حِكْمَةُ الْيَوْمِ</span>
        </h2>
        <span className="text-xs text-muted">A new one each day</span>
      </div>

      <figure className="px-5 py-6">
        <blockquote dir="rtl" lang="ar" className="font-arabic text-xl font-bold leading-loose text-emerald-900 dark:text-amber-200 sm:text-2xl">
          {w.verses ? (
            <div className="space-y-2">
              {w.verses.map(([sadr, ajuz], i) => (
                // Each bayt: ṣadr and ʿajuz side by side, as it's printed.
                <div key={i} className="grid grid-cols-1 gap-x-10 text-center sm:grid-cols-2">
                  <span>{sadr}</span>
                  <span>{ajuz}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">{w.text}</p>
          )}
        </blockquote>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted">{w.meaningEn}</p>
        <figcaption className="mt-5 flex flex-col items-center gap-1 border-t border-amber-200/80 pt-4 text-center dark:border-amber-800/40">
          <span className="flex flex-wrap items-center justify-center gap-2 text-sm text-foreground">
            <span className="font-arabic text-base">{w.authorAr}</span>
            <span className="text-muted">— {w.authorEn}</span>
          </span>
          <span className="text-xs text-muted">
            <span className="font-arabic text-sm">{w.sourceAr}</span> · {w.sourceEn}
          </span>
          <span className="mt-1 flex gap-2 text-[11px] uppercase tracking-wider text-muted">
            <span>{KIND_LABEL[w.kind]}</span>
            {note && <span className="rounded border border-border px-1.5 normal-case tracking-normal">{note}</span>}
          </span>
        </figcaption>
      </figure>
    </section>
  );
}
