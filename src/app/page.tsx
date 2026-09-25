import { DashboardWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib/auth";
import { getDashboard } from "@/server/services/dashboard/getDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  return <DashboardWrapper {...await getDashboard(userId)} />;
}
