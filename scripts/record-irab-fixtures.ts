/**
 * Records real CAMeL Tools analyses for every word in the I'rab test
 * sentences (and the accuracy gold set) into tests/fixtures/irab/camelCandidates.json, so the
 * grammar tests run against genuine morphology — offline and deterministic —
 * instead of hand-written candidates that would only test our assumptions.
 *
 *   npm run irab:record-fixtures      (needs the CAMeL service running)
 *
 * Only candidates that exactly match the typed word are kept (the parser
 * discards the rest anyway), which keeps the fixture small.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { candidatesFor } from "../src/server/services/irab/candidates";
import { candidateMatchesSurface } from "../src/helpers/irab/normalize";
import { tokenizeSentence } from "../src/helpers/irab/tokenize";
import { GOLD } from "../tests/fixtures/irab/gold";
import { FIXTURE_SENTENCES } from "../tests/fixtures/irab/sentences";

async function main() {
  const out: Record<string, unknown[]> = {};
  for (const sentence of [...FIXTURE_SENTENCES, ...GOLD.map(([s]) => s)]) {
    for (const word of tokenizeSentence(sentence)) {
      if (out[word]) continue;
      const all = await candidatesFor(word);
      out[word] = all.filter((c) => c.diac && candidateMatchesSurface(c.diac, word));
    }
  }
  const file = join(__dirname, "..", "tests", "fixtures", "irab", "camelCandidates.json");
  writeFileSync(file, JSON.stringify(out, null, 1) + "\n", "utf8");
  console.log(`Recorded ${Object.keys(out).length} words → ${file}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
