import { DashboardWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { getDashboard } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  return <DashboardWrapper {...await getDashboard(userId)} />;
}
