import { QuizzesWrapper } from "@/libs";
import { getCurrentUserId } from "@/server/lib";

export default async function QuizzesPage() {
  await getCurrentUserId();
  return <QuizzesWrapper />;
}
