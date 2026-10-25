/**
 * A flashcard practice round, as pure state: the cards still to go (current
 * one first), how many are learnt, and which were missed. "Got it" takes a
 * card out of the round; "Again" sends it to the back, so a round ends only
 * once every card has been answered right. Nothing is saved — a round lives
 * in the page.
 */
export interface FlashcardSession {
  /** Indices into the deck's cards still to answer; the first is on screen. */
  queue: number[];
  total: number;
  learnt: number;
  /** Cards answered "Again" at least once this round, in the order they were first missed. */
  missed: number[];
}

export function startSession(cards: number[]): FlashcardSession {
  return { queue: [...cards], total: cards.length, learnt: 0, missed: [] };
}

export function answerCard(session: FlashcardSession, knewIt: boolean): FlashcardSession {
  const [current, ...rest] = session.queue;
  if (current === undefined) return session;
  if (knewIt) return { ...session, queue: rest, learnt: session.learnt + 1 };
  return {
    ...session,
    queue: [...rest, current],
    missed: session.missed.includes(current) ? session.missed : [...session.missed, current],
  };
}

export function isSessionDone(session: FlashcardSession): boolean {
  return session.queue.length === 0;
}

/** Cards answered right the first time they came up. */
export function firstTryCount(session: FlashcardSession): number {
  return session.total - session.missed.length;
}

/** The numbers 0 … count-1 in random order (Fisher–Yates). `random` is injectable for tests. */
export function shuffledIndices(count: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
