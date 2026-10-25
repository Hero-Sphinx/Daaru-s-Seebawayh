import { json, readJson, requireAdmin, withAuth } from "@/server/lib";
import { setSectionRelease } from "@/server/services";
import { releaseBodySchema } from "@/server/validators/flashcards/validate";

/** Admin only: unlock a class deck after the lesson, or lock it again. */
export const POST = withAuth(async ({ req, userId }) => {
  await requireAdmin(userId);
  const { book, section, released } = await readJson(req, releaseBodySchema);
  await setSectionRelease(userId, book, section, released);
  return json({ book, section, released });
});
