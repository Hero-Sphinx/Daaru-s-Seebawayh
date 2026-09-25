import { json, withAuth } from "@/server/lib";
import { summarizeDocument } from "@/server/services";

/** Gemini on a long book, with retries on "high demand" — give it room. */
export const maxDuration = 300;

export const POST = withAuth<{ id: string }>(async ({ userId, params }) => json(await summarizeDocument(userId, params.id)));
