/**
 * An error a route handler turns straight into a JSON response
 * (`{ error: message }` with this status). Anything else thrown from a route
 * is logged and answered with a generic 500 — see server/lib/handler.ts.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message: string) => new ApiError(400, message);
export const unauthorized = (message = "Not signed in") => new ApiError(401, message);
export const forbidden = (message: string) => new ApiError(403, message);
export const notFound = (message = "Not found") => new ApiError(404, message);
export const conflict = (message: string) => new ApiError(409, message);
export const unavailable = (message: string) => new ApiError(503, message);
