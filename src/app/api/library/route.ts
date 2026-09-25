import { ApiError } from "@/server/constants";
import { json, withAuth } from "@/server/lib";
import { listDocuments, uploadDocument, uploadLimitBytes } from "@/server/services";

/** Background OCR of scanned pages runs after the response, within this budget. */
export const maxDuration = 300;

export const GET = withAuth(async ({ userId }) => json(await listDocuments(userId)));

export const POST = withAuth(async ({ req, userId }) => {
  // Refuse an oversized upload before buffering the whole body.
  const declared = Number(req.headers.get("content-length"));
  if (declared > uploadLimitBytes() + 64 * 1024) throw new ApiError(413, "That file is too large to upload here.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, "The upload didn't come through — please try again.");
  }
  const { document, status } = await uploadDocument(userId, form);
  return json(document, status);
});
