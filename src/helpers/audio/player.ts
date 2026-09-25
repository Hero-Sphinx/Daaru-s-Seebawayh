/**
 * One shared <audio> element for the whole page, so starting a new clip
 * always stops the previous one (no overlapping recitations), and a
 * sequence (a verse, word by word) is cancelled by starting anything else.
 */

let audio: HTMLAudioElement | null = null;
let sequenceToken = 0;
/** Settles the promise of whatever clip is currently playing, when it gets replaced. */
let settleCurrent: (() => void) | null = null;

function element(): HTMLAudioElement {
  audio ??= new Audio();
  return audio;
}

function playOne(url: string): Promise<void> {
  const el = element();
  settleCurrent?.();
  el.pause();
  el.src = url;
  return new Promise((resolve, reject) => {
    const done = () => {
      settleCurrent = null;
      resolve();
    };
    settleCurrent = done;
    el.onended = done;
    el.onerror = () => {
      settleCurrent = null;
      reject(new Error("Audio couldn't be loaded — check your connection."));
    };
    el.play().catch((e) => {
      settleCurrent = null;
      reject(e);
    });
  });
}

/** Plays one clip (cancelling any running sequence); resolves when it ends or is replaced. */
export function playClip(url: string): Promise<void> {
  sequenceToken++;
  return playOne(url);
}

/**
 * Plays clips back to back, calling onStep(i) as each starts and
 * onStep(null) once it's over — finished, failed, or cancelled by another
 * playClip/playSequence (the caller should ignore a null from a sequence
 * it has already replaced).
 */
export async function playSequence(urls: string[], onStep: (index: number | null) => void): Promise<void> {
  const token = ++sequenceToken;
  try {
    for (let i = 0; i < urls.length; i++) {
      if (token !== sequenceToken) return;
      onStep(i);
      await playOne(urls[i]);
    }
  } finally {
    onStep(null);
  }
}

export function stopAudio() {
  sequenceToken++;
  settleCurrent?.();
  audio?.pause();
}
