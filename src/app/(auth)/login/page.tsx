import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { safeNextPath } from "@/lib/safe-redirect";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  const canResetByEmail = emailConfigured() || process.env.NODE_ENV !== "production";
  return <AuthForm mode="login" action={login} next={next} canResetByEmail={canResetByEmail} />;
}
