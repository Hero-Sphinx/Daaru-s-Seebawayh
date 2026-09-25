import { redirect } from "next/navigation";
import { safeNextPath } from "@/constants/safeRedirect";
import { LoginWrapper } from "@/libs";
import { getSessionUser } from "@/server/lib/auth";
import { emailConfigured } from "@/server/lib/email";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  return <LoginWrapper next={next} canResetByEmail={emailConfigured() || process.env.NODE_ENV !== "production"} />;
}
