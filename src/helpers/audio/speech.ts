import { playClip } from "@/helpers/audio/player";
import { wordAudioUrl } from "@/helpers/quran/audio";

export interface SpeakResult {
  spoke: boolean;
  reason?: "unsupported" | "no-arabic-voice";
}

let cachedVoices: SpeechSynthesisVoice[] | null = null;
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

// Voices load asynchronously in most browsers — getVoices() can return an
// empty array on the very first call after page load, and speaking into
// that gap silently produces no audio in some browsers (a known Web Speech
// API quirk, not a bug in how this app calls it). Waiting for the
// "voiceschanged" event (with a timeout fallback for browsers that never
// fire it) avoids that race instead of guessing whether voices are ready.
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (cachedVoices) return Promise.resolve(cachedVoices);
  if (voicesPromise) return voicesPromise;
  voicesPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const voices = window.speechSynthesis.getVoices();
      cachedVoices = voices;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(voices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", finish);
    setTimeout(finish, 500);
  });
  return voicesPromise;
}

/**
 * Speaks Arabic text via the browser's built-in speech synthesis, picking
 * an actual Arabic voice explicitly rather than leaving voice selection to
 * the browser's own (unreliable) matching of utterance.lang. Resolves with
 * `spoke: false` instead of silently doing nothing, so callers can tell the
 * user why nothing played — most commonly "no-arabic-voice", which is a
 * real device/OS limitation (no Arabic voice installed) this app can't
 * route around, only explain.
 */
export async function speakArabic(text: string): Promise<SpeakResult> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return { spoke: false, reason: "unsupported" };
  }
  const voices = await loadVoices();
  const arabicVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ar"));
  if (!arabicVoice) {
    return { spoke: false, reason: "no-arabic-voice" };
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = arabicVoice;
  utterance.lang = arabicVoice.lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return { spoke: true };
}

export interface ListenResult {
  ok: boolean;
  /** Why nothing played (shown to the learner). */
  message?: string;
}

/**
 * "Listen" for a vocabulary word, on any device (Android, iPhone, Windows):
 *   1. the app's own pronunciation audio (/api/speech — generated once, then
 *      cached for everyone), a plain audio file that needs nothing installed;
 *   2. the device's Arabic voice, if it has one;
 *   3. the word's recitation in the Qur'an, when it occurs there.
 * playClip is called straight from the click (no await before it), which
 * iPhones require before they'll play audio.
 */
export async function listenArabic(text: string, quran?: { chapter: number; verse: number; word: number } | null): Promise<ListenResult> {
  try {
    await playClip(`/api/speech?text=${encodeURIComponent(text.normalize("NFC"))}`);
    return { ok: true };
  } catch {
    // fall through to the device voice
  }
  const spoken = await speakArabic(text);
  if (spoken.spoke) return { ok: true };
  if (quran) {
    try {
      await playClip(wordAudioUrl(quran.chapter, quran.verse, quran.word));
      return { ok: true };
    } catch {
      // fall through
    }
  }
  return { ok: false, message: "Couldn't play the pronunciation right now — check your connection, or try again in a little while." };
}
