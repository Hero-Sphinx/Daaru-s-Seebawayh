/**
 * Prints the parser's analysis of sentences from the recorded CAMeL fixtures —
 * a quick way to see the i'rab a sentence gets without the UI.
 *
 *   npx tsx scripts/irab-debug.ts "جَاءَ الطَّالِبُ مُسْرِعًا" ...
 */
import camelFixtures from "../tests/fixtures/irab/camelCandidates.json";
import { parseFreeText, toSentenceAnalysis, type RawCandidate } from "../src/helpers/irab/freeTextParser";
import { buildIrabSentence } from "../src/helpers/irab/irabSentence";
import { tokenizeSentence } from "../src/helpers/irab/tokenize";

const FIXTURES = camelFixtures as Record<string, RawCandidate[]>;

for (const text of process.argv.slice(2)) {
  const words = tokenizeSentence(text);
  const missing = words.filter((w) => !(w in FIXTURES));
  if (missing.length) {
    console.log(`${text}\n  (no fixture for ${missing.join("، ")})\n`);
    continue;
  }
  const result = parseFreeText(words.map((w) => ({ surface: w, candidates: FIXTURES[w] })));
  const a = toSentenceAnalysis(result, "debug");
  console.log(`${text}   [${result.patternMatched}]`);
  for (const t of a.tokens) {
    const e = a.edges.find((x) => x.tokenId === t.id);
    const head = e?.headTokenId ? a.tokens.find((x) => x.id === e.headTokenId)!.surfaceForm : "—";
    console.log(`  ${t.surfaceForm}\t${e?.role.code ?? "(unplaced)"}\t← ${head}\t${buildIrabSentence(t, e?.role)?.ar ?? ""}`);
  }
  for (const w of result.warnings) console.log(`  ! ${w}`);
  console.log();
}
