import { candidateMatchesSurface } from "@/helpers";
import type { RawCandidate } from "@/helpers";
import { analyzeWord } from "@/server/helpers";
import { withQuranicCorpusFallback } from "./quranicCorpus";

/**
 * Every morphological candidate the grammar should consider for one typed
 * word — the single place both the I'rab route and book quizzes get them:
 * CAMeL Tools, then the Quranic Arabic Corpus fallback, then imperatives.
 */
export async function candidatesFor(word: string, analyze: (w: string) => Promise<RawCandidate[]> = (w) => analyzeWord(w, false)): Promise<RawCandidate[]> {
  const base = withQuranicCorpusFallback(word, await analyze(word));
  const exact = base.filter((c) => c.diac && candidateMatchesSurface(c.diac, word));
  if (exact.some((c) => c.aspect === "c")) return base;
  // Only rebuild when it can matter (each rebuild is another CAMeL call): the
  // word has no exact analysis at all, or starts with a connecting alif.
  const startsWithAlif = /^[\u0627\u0625]/.test(word.trim());
  if (exact.length > 0 && !startsWithAlif) return base;
  return [...base, ...(await imperativeCandidates(word, analyze))];
}

const MARKS = /[\u064B-\u0652\u0670]/;

function letterGroups(text: string): string[] {
  const groups: string[] = [];
  for (const ch of text) {
    if (MARKS.test(ch) && groups.length) groups[groups.length - 1] += ch;
    else groups.push(ch);
  }
  return groups;
}

/**
 * CAMeL's database (calima-msa-r13) has no imperative analyses for verbs
 * written with a connecting alif — confirmed live: اُكْتُبْ / اُدْرُسْ /
 * اِذْهَبْ return no imperative reading at all (hollow verbs like قُلْ do).
 * Grammatically the imperative *is* the 2nd-person jussive without its
 * prefix, so the jussive is rebuilt and analysed instead:
 *   اُكْتُبْ  → تَكْتُبْ   (Form I, and VII/VIII/X: drop the connecting alif, add تَ)
 *   أَكْرِمْ  → تُكْرِمْ   (Form IV: drop the hamza, add تُ)
 *   عَلِّمْ   → تُعَلِّمْ  (Forms II/III: add تُ; V/VI: add تَ)
 * A rebuilt form is only accepted when CAMeL returns a 2nd-person present
 * whose diacritics match it exactly; the reading is then relabelled as an
 * imperative of the same lemma and person/gender/number.
 */
export async function imperativeCandidates(word: string, analyze: (w: string) => Promise<RawCandidate[]>): Promise<RawCandidate[]> {
  const groups = letterGroups(word.trim());
  if (groups.length < 2) return [];
  const first = groups[0][0];
  const rebuilt: string[] = [];
  if (first === "\u0627" || first === "\u0625") {
    rebuilt.push("تَ" + groups.slice(1).join(""));
  } else if (first === "\u0623") {
    rebuilt.push("تُ" + groups.slice(1).join(""));
  } else {
    rebuilt.push("تُ" + groups.join(""), "تَ" + groups.join(""));
  }

  const out: RawCandidate[] = [];
  for (const form of rebuilt) {
    for (const c of await analyze(form)) {
      // Only the jussive is the imperative's source — an indicative match (تُصَادِقُونَ for the
      // adjective صَادِقُونَ, confirmed live) would invent an imperative that doesn't exist.
      // (CAMeL doesn't always state the mood, so only an explicit indicative/subjunctive is excluded.)
      if (c.pos !== "verb" || c.aspect !== "i" || c.person !== "2" || c.mood === "i" || c.mood === "s" || !c.diac || !candidateMatchesSurface(c.diac, form)) continue;
      out.push({ ...c, aspect: "c", mood: "na", diac: word, bw: c.bw ? c.bw.replace(/^[^+]*\/IV2[A-Z]*\+/, "") : c.bw });
    }
  }
  return out;
}
