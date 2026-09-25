import { redirect } from "next/navigation";
import { safeNextPath } from "@/constants";
import { SignupWrapper } from "@/libs";
import { getSessionUser } from "@/server/lib";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const next = safeNextPath((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  return <SignupWrapper next={next} />;
}
