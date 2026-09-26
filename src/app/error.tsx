"use client";

import Link from "next/link";
import { useEffect } from "react";
import { STATUS_PRIMARY_BUTTON, STATUS_SECONDARY_BUTTON, StatusPage } from "@/layouts";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      wordAr="عُذْرًا"
      title="Something went wrong"
      actions={
        <>
          <button type="button" onClick={reset} className={STATUS_PRIMARY_BUTTON}>
            Try again
          </button>
          <Link href="/" className={STATUS_SECONDARY_BUTTON}>
            Back to the dashboard
          </Link>
        </>
      }
    >
      This page couldn&apos;t be loaded. It&apos;s usually temporary — please try again in a moment.
      {error.digest && <span className="mt-2 block text-xs">Reference: {error.digest}</span>}
    </StatusPage>
  );
}
