/** Extracts a short context window around the first match of `query` in `text`, for search results. */
export function extractSnippet(text: string, query: string, contextChars = 60): string | null {
  const index = text.indexOf(query);
  if (index === -1) return null;

  const start = Math.max(0, index - contextChars);
  const end = Math.min(text.length, index + query.length + contextChars);

  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return prefix + text.slice(start, end) + suffix;
}
