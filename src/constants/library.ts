/** 20MB — generous for a text-heavy book PDF, not a scanned-image one. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Vercel refuses any request body over 4.5MB before the function even runs
 * (a platform limit, not configurable), so on Vercel uploads are capped a
 * little under that to leave room for the multipart envelope.
 */
export const VERCEL_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export function formatMegabytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)}MB`;
}
