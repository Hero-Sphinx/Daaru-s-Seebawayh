import { redirect } from "next/navigation";
import { safeNextPath } from "@/constants";
import { LoginWrapper } from "@/libs";
import { emailConfigured, getSessionUser } from "@/server/lib";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  return <LoginWrapper next={next} canResetByEmail={emailConfigured() || process.env.NODE_ENV !== "production"} />;
}
