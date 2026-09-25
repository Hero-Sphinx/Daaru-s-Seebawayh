/**
 * Thin wrappers around Date.now()/new Date() so components/hooks never call
 * them directly — the react-hooks/purity lint rule flags that as an impure
 * render call, even for one-shot Server Components and event handlers.
 */

export function nowMs(): number {
  return Date.now();
}

export function daysAgo(days: number): Date {
  return new Date(nowMs() - days * 24 * 60 * 60 * 1000);
}
