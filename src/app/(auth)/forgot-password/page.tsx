import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm action={requestPasswordReset} />;
}
