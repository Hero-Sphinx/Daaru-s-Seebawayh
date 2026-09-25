"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-fetches the current server-rendered page every few seconds while
 * something is still processing in the background (e.g. OCR of a scanned
 * book), so new pages appear without a manual reload. Renders nothing;
 * mount it only while `active`, and it stops as soon as that turns false.
 */
export default function ProcessingRefresher({ active, intervalMs = 8000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs, router]);
  return null;
}
