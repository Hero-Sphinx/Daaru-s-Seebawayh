import { badRequest, notFound } from "@/server/constants";
import { json, withAuth } from "@/server/lib";
import { getVerseTafsir } from "@/server/services";

/** Brief tafsīr of one āyah (al-Muyassar, al-Mukhtaṣar). Shared reference data, not per-user. */
export const GET = withAuth<{ chapter: string; verse: string }>(async ({ params }) => {
  if (!/^\d{1,3}$/.test(params.chapter) || !/^\d{1,3}$/.test(params.verse)) throw badRequest("Invalid āyah");
  const chapter = Number(params.chapter);
  const verse = Number(params.verse);
  if (chapter < 1 || chapter > 114 || verse < 1) throw badRequest("Invalid āyah");
  const tafsir = await getVerseTafsir(chapter, verse);
  if (!tafsir) throw notFound("No tafsīr for this āyah");
  return json(tafsir);
});
