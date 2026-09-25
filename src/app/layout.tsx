import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import { cookies } from "next/headers";
import { Footer, Navbar } from "@/layouts";
import { SESSION_COOKIE } from "@/constants/auth";
import { ARABIC_SCALE_COOKIE, clampArabicScale, THEME_COOKIE } from "@/constants/themePrefs";
import "@/styles/globals.css";

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
        <Navbar initialIsDark={isDark} initialArabicScale={arabicScale} signedIn={cookieStore.has(SESSION_COOKIE)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
