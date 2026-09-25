import { SettingsWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib/auth";
import { getSettingsPage } from "@/server/services/settings/getSettingsPage";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  return <SettingsWrapper {...await getSettingsPage(userId)} />;
}
