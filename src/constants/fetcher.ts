/**
 * Client-side JSON fetch for the app's own API. Every route answers errors
 * as `{ error }`; this turns them — and the cases that never reach a route
 * (no connection, a platform's HTML error page, an expired session) — into
 * an Error whose message can be shown to the learner as-is.
 */
export class FetchError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "FetchError";
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  401: "Your session has ended — please sign in again.",
  413: "That's too large to send.",
  429: "Too many requests — please wait a moment and try again.",
  502: "A service we depend on didn't answer properly — please try again.",
  503: "That service is unavailable right now — please try again in a little while.",
  504: "That took too long — please try again.",
};

export default async function fetcher<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const request: RequestInit = json === undefined ? rest : { ...rest, body: JSON.stringify(json), headers: { "Content-Type": "application/json", ...rest.headers } };

  let res: Response;
  try {
    res = await fetch(url, request);
  } catch (err) {
    if (err instanceof DOMException && (err.name === "AbortError" || err.name === "TimeoutError")) throw err;
    throw new FetchError("Couldn't reach the server — check your connection and try again.", 0);
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (body && typeof body.error === "string" && body.error) || STATUS_MESSAGES[res.status] || "Something went wrong — please try again.";
    throw new FetchError(message, res.status);
  }
  return body as T;
}

/** The message to show for anything thrown by fetcher (or elsewhere). */
export function errorMessage(err: unknown, fallback = "Something went wrong — please try again."): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
