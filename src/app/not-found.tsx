import Link from "next/link";
import { STATUS_PRIMARY_BUTTON, STATUS_SECONDARY_BUTTON, StatusPage } from "@/layouts";

export default function NotFound() {
  return (
    <StatusPage
      wordAr="لَمْ نَجِدْهُ"
      title="We couldn't find that page"
      actions={
        <>
          <Link href="/" className={STATUS_PRIMARY_BUTTON}>
            Back to the dashboard
          </Link>
          <Link href="/library" className={STATUS_SECONDARY_BUTTON}>
            Open the library
          </Link>
        </>
      }
    >
      The link may be mistyped, or the document may have been deleted or is no longer shared with you.
    </StatusPage>
  );
}
