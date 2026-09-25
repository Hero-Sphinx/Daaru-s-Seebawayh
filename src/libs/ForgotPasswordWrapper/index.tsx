import { requestPasswordReset } from "@/server/actions/auth";
import { ForgotPasswordForm } from "../shared/PasswordResetForms";

export default function ForgotPasswordWrapper() {
  return <ForgotPasswordForm action={requestPasswordReset} />;
}
