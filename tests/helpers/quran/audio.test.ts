import { describe, expect, it } from "vitest";
import { wordAudioUrl } from "@/helpers/quran/audio";

describe("wordAudioUrl", () => {
  it("zero-pads chapter, verse and word to the CDN's 3-digit scheme", () => {
    expect(wordAudioUrl(1, 1, 1)).toBe("https://audio.qurancdn.com/wbw/001_001_001.mp3");
    expect(wordAudioUrl(2, 282, 128)).toBe("https://audio.qurancdn.com/wbw/002_282_128.mp3");
    expect(wordAudioUrl(114, 6, 3)).toBe("https://audio.qurancdn.com/wbw/114_006_003.mp3");
  });
});
