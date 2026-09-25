import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/components";

/**
 * The header of each section page — a soft tinted band in the section's own
 * colour (the same one it has on the dashboard), its icon, its Arabic and
 * English name, and its Arabic name again as a quiet watermark. Lively,
 * never loud: pastel in light mode, deep and low-contrast in dark mode.
 */
export type BannerTone = "emerald" | "amber" | "teal" | "sky" | "rose" | "stone";

const TONES: Record<BannerTone, { band: string; tile: string; watermark: string; accent: string }> = {
  emerald: {
    band: "border-emerald-200/80 from-emerald-50 via-white to-teal-50 dark:border-emerald-900/50 dark:from-emerald-950/70 dark:via-parchment-800 dark:to-teal-950/50",
    tile: "bg-emerald-600 text-white shadow-emerald-600/30",
    watermark: "text-emerald-700",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    band: "border-amber-200/80 from-amber-50 via-white to-orange-50 dark:border-amber-900/50 dark:from-amber-950/50 dark:via-parchment-800 dark:to-orange-950/30",
    tile: "bg-amber-500 text-white shadow-amber-500/30",
    watermark: "text-amber-700",
    accent: "text-amber-700 dark:text-amber-300",
  },
  teal: {
    band: "border-teal-200/80 from-teal-50 via-white to-emerald-50 dark:border-teal-900/50 dark:from-teal-950/60 dark:via-parchment-800 dark:to-emerald-950/40",
    tile: "bg-teal-600 text-white shadow-teal-600/30",
    watermark: "text-teal-700",
    accent: "text-teal-700 dark:text-teal-300",
  },
  sky: {
    band: "border-sky-200/80 from-sky-50 via-white to-indigo-50 dark:border-sky-900/50 dark:from-sky-950/60 dark:via-parchment-800 dark:to-indigo-950/40",
    tile: "bg-sky-600 text-white shadow-sky-600/30",
    watermark: "text-sky-700",
    accent: "text-sky-700 dark:text-sky-300",
  },
  rose: {
    band: "border-rose-200/80 from-rose-50 via-white to-amber-50 dark:border-rose-900/50 dark:from-rose-950/50 dark:via-parchment-800 dark:to-amber-950/30",
    tile: "bg-rose-500 text-white shadow-rose-500/30",
    watermark: "text-rose-700",
    accent: "text-rose-700 dark:text-rose-300",
  },
  stone: {
    band: "border-border from-stone-50 via-white to-emerald-50/60 dark:from-parchment-800 dark:via-parchment-800 dark:to-emerald-950/30",
    tile: "bg-brand text-brand-contrast shadow-black/10",
    watermark: "text-stone-600",
    accent: "text-muted",
  },
};

export default function PageBanner({
  tone,
  icon: Icon,
  title,
  titleAr,
  description,
  children,
}: {
  tone: BannerTone;
  icon?: ComponentType<IconProps>;
  title: string;
  titleAr: string;
  description?: ReactNode;
  /** Actions or stats on the right. */
  children?: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <header className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm sm:p-6 ${t.band}`}>
      <span aria-hidden className={`site-chrome pointer-events-none absolute -bottom-6 -left-2 select-none text-[88px] font-bold leading-none opacity-[0.07] sm:text-[120px] ${t.watermark}`}>
        <span className="font-arabic">{titleAr}</span>
      </span>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg ${t.tile}`}>
              <Icon className="h-6 w-6" />
            </span>
          )}
          <div>
            <p className={`font-arabic text-lg leading-snug ${t.accent}`} lang="ar" dir="rtl">
              {titleAr}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{description}</p>}
          </div>
        </div>
        {children && <div className="relative flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
