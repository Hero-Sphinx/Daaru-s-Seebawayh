import Link from "next/link";
import { resetPassword } from "@/server/actions/auth";
import { AUTH_CARD } from "../shared/authStyles";
import { ResetPasswordForm } from "../shared/PasswordResetForms";

export default function ResetPasswordWrapper({ token, valid }: { token: string; valid: boolean }) {
  if (!valid) {
    return (
      <div className={AUTH_CARD}>
        <h1 className="text-xl font-semibold text-foreground">Link expired</h1>
        <p className="text-sm text-muted">This reset link is invalid, already used, or older than an hour.</p>
        <Link href="/forgot-password" className="block text-center text-sm font-medium text-brand hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }
  return <ResetPasswordForm token={token} action={resetPassword} />;
}
