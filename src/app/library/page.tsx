import { LibraryWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";
import { getLibraryPage } from "@/server/services";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const userId = await getCurrentUserId();
  return <LibraryWrapper {...await getLibraryPage(userId)} />;
}
