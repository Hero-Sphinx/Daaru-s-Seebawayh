/**
 * Accuracy report: runs the parser over every gold sentence
 * (tests/fixtures/irab/gold.ts, using the recorded CAMeL analyses) and
 * prints correct / refused / wrong, with the reason for each non-correct one.
 *
 *   npm run irab:accuracy            (summary + every wrong and refused sentence)
 *   npm run irab:accuracy -- --all   (also list the correct ones)
 */
import camelFixtures from "../tests/fixtures/irab/camelCandidates.json";
import { GOLD } from "../tests/fixtures/irab/gold";
import { scoreParse, type Verdict } from "../src/helpers/irab/accuracy";
import { parseFreeText, type RawCandidate } from "../src/helpers/irab/freeTextParser";
import { tokenizeSentence } from "../src/helpers/irab/tokenize";

const FIXTURES = camelFixtures as Record<string, RawCandidate[]>;
const showAll = process.argv.includes("--all");

const rows: { sentence: string; verdict: Verdict; issues: string[] }[] = [];
for (const [sentence, gold] of GOLD) {
  const words = tokenizeSentence(sentence);
  const missing = words.filter((w) => !(w in FIXTURES));
  if (missing.length) {
    console.error(`No CAMeL fixture for ${missing.join("، ")} — run npm run irab:record-fixtures`);
    process.exit(1);
  }
  const result = parseFreeText(words.map((w) => ({ surface: w, candidates: FIXTURES[w] })));
  rows.push({ sentence, ...scoreParse(result, gold) });
}

const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
const pct = (n: number) => `${((n / rows.length) * 100).toFixed(1)}%`;
for (const v of ["wrong", "refused", ...(showAll ? ["correct"] : [])] as Verdict[]) {
  const list = rows.filter((r) => r.verdict === v);
  if (!list.length) continue;
  console.log(`\n== ${v.toUpperCase()} (${list.length})`);
  for (const r of list) console.log(`  ${r.sentence}${r.issues.length ? `\n      ${r.issues.join("\n      ")}` : ""}`);
}
console.log(`\n${rows.length} sentences — correct ${count("correct")} (${pct(count("correct"))}), refused ${count("refused")} (${pct(count("refused"))}), wrong ${count("wrong")} (${pct(count("wrong"))})`);
