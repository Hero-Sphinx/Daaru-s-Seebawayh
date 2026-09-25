/** A display name worth greeting someone by — not empty, and not the old development placeholder ("Dev User"). */
export function realName(displayName: string | null | undefined): string | null {
  const n = displayName?.trim();
  if (!n || /^dev(\s|-|_)?user$/i.test(n)) return null;
  return n;
}
