import type { Metadata } from "next";
import { ResetPasswordWrapper } from "@/libs";
import { findResetToken } from "@/server/services/auth/passwordReset";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const raw = (await searchParams).token;
  const token = typeof raw === "string" ? raw : "";
  // Checked up front so an expired link says so before the form is filled in (and again on submit).
  return <ResetPasswordWrapper token={token} valid={Boolean(await findResetToken(token))} />;
}
