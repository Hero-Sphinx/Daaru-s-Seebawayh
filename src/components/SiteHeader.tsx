"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AwardIcon, BookIcon, DiagramIcon, HouseIcon, LightbulbIcon, MoonIcon, MushafIcon, QuizIcon, ScrollIcon, SunIcon } from "@/components/icons";
import { ARABIC_SCALE_COOKIE, ARABIC_SCALE_STEP, clampArabicScale, MAX_ARABIC_SCALE, MIN_ARABIC_SCALE, setPrefCookie, THEME_COOKIE } from "@/lib/theme-prefs";
import { logout } from "@/app/(auth)/actions";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: HouseIcon },
  { href: "/vocabulary", label: "Vocabulary", icon: BookIcon },
  { href: "/irab", label: "I'rab", icon: DiagramIcon },
  { href: "/quran", label: "Qur'an", icon: MushafIcon },
  { href: "/library", label: "Library", icon: ScrollIcon },
  { href: "/quizzes", label: "Quizzes", icon: QuizIcon },
  { href: "/guide", label: "Guide", icon: LightbulbIcon },
  { href: "/vision", label: "Vision", icon: AwardIcon },
];

export const FULL_NAME_AR = "دَارُ سِيبَوَيْهِ لِتَعْلِيمِ اللُّغَةِ الْعَرَبِيَّةِ وَالْإِسْلَامِيَّةِ";
export const FULL_NAME_EN = "Daaru-s-Seebawayh Li Ta'leemi Al-Lughatil 'Arabiyyati wal Islaamiyyati";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type SiteHeaderProps = {
  // Computed server-side from cookies (src/app/layout.tsx) so the very
  // first render already matches — no flash, no hydration mismatch.
  initialIsDark: boolean;
  initialArabicScale: number;
  // Cookie *presence* only — enough to decide whether to show the nav and
  // account controls. Pages themselves do the real session check.
  signedIn: boolean;
};

/**
 * Whether the full-name band should show: hidden once the user scrolls down
 * past the top, shown again as soon as they scroll up (or reach the top).
 *
 * Folding the band changes the header's height, and the browser compensates
 * by shifting the scroll position (scroll anchoring) — which looks like a
 * scroll in the other direction and would reopen the band, over and over
 * (the mid-page flicker). So after each change, scroll events are ignored
 * until the fold animation has finished, and the position is re-read then.
 * A dead zone also ignores tiny jitters.
 */
const BAND_ANIMATION_MS = 350;

function useNameBandVisibility(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let lastY = window.scrollY;
    let shown = true;
    let settlingUntil = 0;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (performance.now() < settlingUntil) {
          lastY = y; // the page's own adjustment, not the user
          return;
        }
        let next = shown;
        if (y < 48) next = true;
        else if (y > lastY + 12) next = false;
        else if (y < lastY - 12) next = true;
        else return; // inside the dead zone: keep lastY so slow scrolls still add up
        lastY = y;
        if (next !== shown) {
          shown = next;
          settlingUntil = performance.now() + BAND_ANIMATION_MS;
          setVisible(next);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return visible;
}

const ICON_BUTTON =
  "inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-2.5 text-sm text-muted transition hover:border-brand/40 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";

export default function SiteHeader({ initialIsDark, initialArabicScale, signedIn }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(initialIsDark);
  const [scale, setScale] = useState(initialArabicScale);
  const nameBandVisible = useNameBandVisibility();

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    setPrefCookie(THEME_COOKIE, next ? "dark" : "light");
  }

  function changeScale(delta: number) {
    const next = clampArabicScale(scale + delta);
    setScale(next);
    document.documentElement.style.setProperty("--arabic-scale", String(next / 100));
    setPrefCookie(ARABIC_SCALE_COOKIE, String(next));
  }

  return (
    <header className="site-chrome sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={FULL_NAME_EN}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand font-arabic text-2xl leading-none text-brand-contrast">
            س
          </span>
          <span className="min-w-0">
            <span className="block font-arabic text-xl font-bold leading-snug text-foreground">دَارُ سِيبَوَيْهِ</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Daaru-s-Seebawayh</span>
          </span>
        </Link>

        {!signedIn && (
          // Signed out (sign-in / sign-up / reset pages): what the platform is and how it works, front and centre.
          <nav aria-label="About" className="hidden items-center gap-2 sm:flex">
            <Link
              href="/vision"
              aria-current={isActive(pathname, "/vision") ? "page" : undefined}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-700/25 transition hover:opacity-90 aria-[current=page]:ring-2 aria-[current=page]:ring-amber-400"
            >
              <AwardIcon className="h-4 w-4" /> Our vision
              <span className="font-arabic text-base font-normal text-emerald-100">رُؤْيَتُنَا</span>
            </Link>
            <Link
              href="/guide"
              aria-current={isActive(pathname, "/guide") ? "page" : undefined}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 aria-[current=page]:bg-emerald-50 dark:aria-[current=page]:bg-emerald-950/40"
            >
              <LightbulbIcon className="h-4 w-4" /> How it works
            </Link>
          </nav>
        )}

        {signedIn && (
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-3 py-2 text-sm transition ${
                    active ? "font-semibold text-foreground" : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                  {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded bg-brand" />}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center rounded-md border border-border bg-surface sm:flex" role="group" aria-label="Arabic text size">
            <button
              type="button"
              onClick={() => changeScale(-ARABIC_SCALE_STEP)}
              disabled={scale <= MIN_ARABIC_SCALE}
              aria-label="Smaller Arabic text"
              className="h-9 px-2.5 font-arabic text-sm text-muted transition hover:text-foreground disabled:opacity-40"
            >
              ع−
            </button>
            <span className="min-w-12 border-x border-border px-1 text-center text-xs tabular-nums text-muted" aria-live="polite">
              {scale}%
            </span>
            <button
              type="button"
              onClick={() => changeScale(ARABIC_SCALE_STEP)}
              disabled={scale >= MAX_ARABIC_SCALE}
              aria-label="Larger Arabic text"
              className="h-9 px-2.5 font-arabic text-base text-muted transition hover:text-foreground disabled:opacity-40"
            >
              ع+
            </button>
          </div>

          <button type="button" onClick={toggleDarkMode} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} className={ICON_BUTTON}>
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>

          {signedIn && (
            <>
              <Link href="/settings" className={`${ICON_BUTTON} hidden sm:inline-flex`}>
                Settings
              </Link>
              <form action={logout}>
                <button type="submit" className={ICON_BUTTON}>
                  Sign out
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* The full name, in Arabic and in transliteration — its own line so it's never truncated or clipped.
          It folds away while scrolling down and comes back on scrolling up (grid-rows 1fr ↔ 0fr animates the height). */}
      <div
        aria-hidden={!nameBandVisible}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          nameBandVisible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className={`overflow-hidden bg-background/60 ${nameBandVisible ? "border-t border-border/70" : ""}`}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-0.5 px-4 py-1.5 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
          <p dir="rtl" lang="ar" className="font-arabic text-base leading-loose text-foreground/90">
            {FULL_NAME_AR}
          </p>
          <p className="text-[11px] tracking-wide text-muted">{FULL_NAME_EN}</p>
        </div>
        </div>
      </div>

      {!signedIn && (
        <nav aria-label="About" className="flex gap-2 border-t border-border px-3 py-2 sm:hidden">
          <Link href="/vision" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 py-2 text-sm font-semibold text-white shadow-sm">
            <AwardIcon className="h-4 w-4" /> Our vision
          </Link>
          <Link href="/guide" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-600 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <LightbulbIcon className="h-4 w-4" /> How it works
          </Link>
        </nav>
      )}

      {signedIn && (
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition ${
                  active ? "bg-brand text-brand-contrast" : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
