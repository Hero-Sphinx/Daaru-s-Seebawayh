import type { ReactNode } from "react";

/**
 * A full-width message card for the app's own 404 / error screens, in the
 * same parchment-and-green style as the rest of the site (the framework's
 * defaults are plain black-on-white and ignore dark mode).
 */
export default function StatusPage({
  wordAr,
  title,
  children,
  actions,
}: {
  /** A large Arabic word as the card's watermark-style heading. */
  wordAr: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <span aria-hidden className="site-chrome pointer-events-none absolute -bottom-8 -left-2 select-none text-[120px] font-bold leading-none text-emerald-700 opacity-[0.06]">
          <span className="font-arabic">{wordAr}</span>
        </span>
        <p lang="ar" dir="rtl" className="relative font-arabic text-3xl text-emerald-800 dark:text-amber-200">
          {wordAr}
        </p>
        <h1 className="relative mt-2 text-xl font-bold text-foreground">{title}</h1>
        {children && <div className="relative mt-2 text-sm leading-relaxed text-muted">{children}</div>}
        {actions && <div className="relative mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export const STATUS_PRIMARY_BUTTON = "rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600";
export const STATUS_SECONDARY_BUTTON =
  "rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40";
