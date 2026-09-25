import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSessionUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-redirect";
import { signup } from "../actions";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  return <AuthForm mode="signup" action={signup} next={next} />;
}
