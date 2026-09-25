/**
 * Word-by-word Qur'an recitation audio, served by Quran.com's public CDN
 * (https://quran.com — attribution shown wherever it plays). Real human
 * recitation, not text-to-speech: synthesized "recitation" of Qur'anic text
 * would get tajwid wrong, so TTS is deliberately never used for it.
 *
 * Verified before relying on it: the CDN's word numbering matches the
 * Quranic Arabic Corpus word numbers this app stores in
 * tokens.position_in_unit — spot-checked across 9 verses (incl. 2:282's 128
 * words and the two-part word in 37:130): word N exists, N+1 is a 404.
 * CORS is open, so the browser can play it directly.
 */

const WORD_AUDIO_BASE = "https://audio.qurancdn.com/wbw";

const pad3 = (n: number) => String(n).padStart(3, "0");

export function wordAudioUrl(chapter: number, verse: number, word: number): string {
  return `${WORD_AUDIO_BASE}/${pad3(chapter)}_${pad3(verse)}_${pad3(word)}.mp3`;
}

export const QURAN_AUDIO_ATTRIBUTION = "Recitation audio: Quran.com";
