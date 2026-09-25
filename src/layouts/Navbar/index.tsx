"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AwardIcon, BookIcon, DiagramIcon, HouseIcon, LightbulbIcon, MoonIcon, MushafIcon, QuizIcon, ScrollIcon, SunIcon } from "@/components/Icons";
import { ARABIC_SCALE_COOKIE, ARABIC_SCALE_STEP, clampArabicScale, MAX_ARABIC_SCALE, MIN_ARABIC_SCALE, setPrefCookie, THEME_COOKIE } from "@/constants/themePrefs";
import { FULL_NAME_AR, FULL_NAME_EN } from "@/constants/site";
import { logout } from "@/server/actions/auth";

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

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type NavbarProps = {
  // Computed server-side from cookies (src/app/layout.tsx) so the very
  // first render already matches — no flash, no hydration mismatch.
  initialIsDark: boolean;
  initialArabicScale: number;
  // Cookie *presence* only — enough to decide whether to show the nav and
  // account controls. Pages themselves do the real session check.
  signedIn: boolean;
};

/**
 * Whether the header chrome should show. It hides once the page has been
 * scrolled a little way down, and comes back only at the very top — not on
 * every small upward scroll, which on phones (momentum scrolling, the address
 * bar resizing) made it flip back and forth.
 *
 * The two thresholds are far apart on purpose: on large screens folding the
 * name band shortens the header, and the browser nudges the scroll position
 * by that much (scroll anchoring). With a single threshold that nudge would
 * cross it again and reopen the band; with this gap it never can.
 */
const HIDE_AFTER_PX = 140;
const SHOW_AT_PX = 2;

function useNameBandVisibility(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let shown = true;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (shown && y > HIDE_AFTER_PX) {
          shown = false;
          setVisible(false);
        } else if (!shown && y <= SHOW_AT_PX) {
          shown = true;
          setVisible(true);
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
  "inline-flex h-9 items-center justify-center rounded-xl border border-emerald-200/80 bg-white/70 px-2.5 text-sm text-emerald-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:border-emerald-900/60 dark:bg-white/5 dark:text-emerald-200 dark:hover:bg-emerald-950/50";

export default function Navbar({ initialIsDark, initialArabicScale, signedIn }: NavbarProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(initialIsDark);
  const [scale, setScale] = useState(initialArabicScale);
  // Scrolling down: on phones the whole header slides away (it's tall there); on
  // large screens only the name band folds. Scrolling up brings it all back.
  const chromeVisible = useNameBandVisibility();

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
    <header
      className={`site-chrome sticky top-0 z-40 border-b border-emerald-200/70 bg-gradient-to-r from-emerald-50/95 via-white/95 to-amber-50/95 shadow-sm backdrop-blur transition-[transform,opacity] duration-500 ease-in-out will-change-transform motion-reduce:transition-none dark:border-emerald-900/50 dark:from-emerald-950/90 dark:via-parchment-800/95 dark:to-teal-950/80 ${
        chromeVisible ? "" : "max-lg:-translate-y-full max-lg:opacity-0"
      }`}
    >
      {/* A thin green-and-gold line across the very top. */}
      <div aria-hidden className="h-1 bg-gradient-to-r from-emerald-700 via-teal-500 to-amber-400" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label={FULL_NAME_EN}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 font-arabic text-2xl leading-none text-amber-300 shadow-md shadow-emerald-800/30 ring-2 ring-amber-300/40 transition group-hover:scale-105">
            س
          </span>
          <span className="min-w-0">
            <span className="block font-arabic text-xl font-bold leading-snug text-emerald-900 dark:text-amber-200">دَارُ سِيبَوَيْهِ</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80 dark:text-emerald-300/80">Daaru-s-Seebawayh</span>
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
                  className={`rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-emerald-700 font-semibold text-white shadow-sm shadow-emerald-700/30"
                      : "text-emerald-900/80 hover:bg-emerald-100/70 hover:text-emerald-900 dark:text-emerald-100/80 dark:hover:bg-emerald-900/40 dark:hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center rounded-xl border border-emerald-200/80 bg-white/70 shadow-sm dark:border-emerald-900/60 dark:bg-white/5 sm:flex" role="group" aria-label="Arabic text size">
            <button
              type="button"
              onClick={() => changeScale(-ARABIC_SCALE_STEP)}
              disabled={scale <= MIN_ARABIC_SCALE}
              aria-label="Smaller Arabic text"
              className="h-9 px-2.5 font-arabic text-sm text-emerald-800 transition hover:text-emerald-600 disabled:opacity-40 dark:text-emerald-200"
            >
              ع−
            </button>
            <span className="min-w-12 border-x border-emerald-200/80 px-1 text-center text-xs font-medium tabular-nums text-emerald-800 dark:border-emerald-900/60 dark:text-emerald-200" aria-live="polite">
              {scale}%
            </span>
            <button
              type="button"
              onClick={() => changeScale(ARABIC_SCALE_STEP)}
              disabled={scale >= MAX_ARABIC_SCALE}
              aria-label="Larger Arabic text"
              className="h-9 px-2.5 font-arabic text-base text-emerald-800 transition hover:text-emerald-600 disabled:opacity-40 dark:text-emerald-200"
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
      {/* On phones the band stays (the whole header slides instead); on large screens it folds on its own. */}
      <div
        className={`grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none ${
          chromeVisible ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0"
        }`}
      >
        <div className="overflow-hidden border-t border-emerald-200/60 bg-gradient-to-r from-emerald-700/[0.06] via-transparent to-amber-400/[0.08] dark:border-emerald-900/40">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-0.5 px-4 py-1.5 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6">
            <p dir="rtl" lang="ar" className="font-arabic text-base leading-loose text-emerald-900 dark:text-amber-100">
              {FULL_NAME_AR}
            </p>
            <p className="text-[11px] tracking-wide text-emerald-800/70 dark:text-emerald-200/70">{FULL_NAME_EN}</p>
          </div>
        </div>
      </div>

      {!signedIn && (
        <nav aria-label="About" className="flex gap-2 border-t border-emerald-200/60 px-3 py-2 dark:border-emerald-900/40 sm:hidden">
          <Link href="/vision" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 py-2 text-sm font-semibold text-white shadow-sm">
            <AwardIcon className="h-4 w-4" /> Our vision
          </Link>
          <Link href="/guide" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-600 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <LightbulbIcon className="h-4 w-4" /> How it works
          </Link>
        </nav>
      )}

      {signedIn && (
        <nav aria-label="Main" className="flex gap-1.5 overflow-x-auto border-t border-emerald-200/60 px-3 py-2 dark:border-emerald-900/40 lg:hidden">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/30"
                    : "border border-emerald-200/80 bg-white/60 text-emerald-900 dark:border-emerald-900/60 dark:bg-white/5 dark:text-emerald-100"
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
