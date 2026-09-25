import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import { cookies } from "next/headers";
import SiteHeader, { FULL_NAME_AR, FULL_NAME_EN } from "@/components/SiteHeader";
import { SESSION_COOKIE } from "@/lib/auth-constants";
import { ARABIC_SCALE_COOKIE, clampArabicScale, THEME_COOKIE } from "@/lib/theme-prefs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Daaru-s-Seebawayh Li Ta'leemi Al-Lughatil 'Arabiyyati wal Islaamiyyati",
  description: "Deterministic Arabic learning & I'rab platform",
};

// Theme/font-size are read from cookies and applied server-side, in the
// first byte of HTML — no client-side "no-flash" init script needed (and
// none of the hydration/reconciliation quirks that come with rendering a
// <script> element inside the React tree).
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const isDark = cookieStore.get(THEME_COOKIE)?.value === "dark";

  const arabicScale = clampArabicScale(Number(cookieStore.get(ARABIC_SCALE_COOKIE)?.value ?? NaN));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} h-full antialiased ${isDark ? "dark" : ""}`}
      style={{ "--arabic-scale": String(arabicScale / 100) } as CSSProperties}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader initialIsDark={isDark} initialArabicScale={arabicScale} signedIn={cookieStore.has(SESSION_COOKIE)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="site-chrome border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              <span dir="rtl" lang="ar" className="font-arabic text-sm text-foreground/80">
                {FULL_NAME_AR}
              </span>
              <span className="sr-only"> — {FULL_NAME_EN}</span>
            </p>
            <p>
              Qur&apos;anic morphology: <a className="underline hover:text-foreground" href="https://corpus.quran.com" target="_blank" rel="noreferrer">Quranic Arabic Corpus</a> ·
              Recitation audio: <a className="underline hover:text-foreground" href="https://quran.com" target="_blank" rel="noreferrer">Quran.com</a> ·
              Morphological analysis: CAMeL Tools
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
