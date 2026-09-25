import type { Metadata } from "next";
import Link from "next/link";
import { AUTH_CARD, ResetPasswordForm } from "@/components/PasswordResetForms";
import { findResetToken } from "@/lib/password-reset";
import { resetPassword } from "../actions";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";
  // Checked up front so an expired link says so before the form is filled in (and again on submit).
  if (!(await findResetToken(token))) {
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
