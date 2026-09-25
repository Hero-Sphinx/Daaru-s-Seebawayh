import type { Metadata } from "next";
import { ForgotPasswordWrapper } from "@/libs";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordWrapper />;
}
