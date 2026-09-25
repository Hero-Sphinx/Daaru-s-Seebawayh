import { poolDistractors, similarRoots } from "./distractors";
import { shuffle } from "./primitives";
import type { LoadedTemplate, QuizItem, QuizItemField, QuizSource, TemplateBody } from "./template-types";

/**
 * Generic interpreter for quiz_templates.template_body. Pure: the caller
 * (the session route) loads templates + source items + reference pools from
 * the DB and passes them in, so this is fully unit-testable with no DB.
 */

export interface DistractorContext {
  /** Every root letters string in the dictionary, for similar_root. */
  roots: string[];
  /** Lemmas by root letters, for lemmas_from_similar_roots. */
  lemmasByRoot: Map<string, string[]>;
  /** POS display labels grouped by category (noun / verb / particle), for pos_same_category. */
  posLabelsByCategory: Map<string, string[]>;
}

export interface TemplateQuestion {
  id: string;
  templateId: string;
  templateCode: string;
  quizType: string;
  topic: TemplateBody["topic"];
  promptEn: string;
  promptAr?: string;
  options: string[];
  correctIndex: number;
  ruleReference?: string;
  explanation?: string;
}

const PLACEHOLDER_RE = /\{(\w+)\}/g;
const DISTRACTOR_COUNT = 3;

function placeholders(text: string | undefined): string[] {
  return text ? [...text.matchAll(PLACEHOLDER_RE)].map((m) => m[1]) : [];
}

function fill(text: string, values: Record<string, string | undefined>): string {
  return text.replace(PLACEHOLDER_RE, (_m, name: string) => values[name] ?? "");
}

/** An item is usable by a template only if every field the template reads is present. */
export function itemFitsTemplate(body: TemplateBody, item: QuizItem): boolean {
  if (body.where?.posCategory && item.posCategory !== body.where.posCategory) return false;
  const needed = new Set<string>([
    body.answerField,
    ...(body.where?.require ?? []),
    ...placeholders(body.prompt.en),
    ...placeholders(body.prompt.ar),
    ...placeholders(body.explanation).filter((p) => p !== "answer"),
  ]);
  for (const field of needed) {
    if (!item[field as QuizItemField]) return false;
  }
  return true;
}

function pickDistractors(body: TemplateBody, item: QuizItem, pool: QuizItem[], ctx: DistractorContext, rng: () => number): string[] {
  const correct = item[body.answerField]!;
  const d = body.distractors;
  switch (d.strategy) {
    case "fixed":
      return poolDistractors(correct, d.values, DISTRACTOR_COUNT, rng);
    case "pool":
      return poolDistractors(correct, pool.map((p) => p[body.answerField] ?? ""), DISTRACTOR_COUNT, rng);
    case "similar_root":
      return similarRoots(correct, ctx.roots, DISTRACTOR_COUNT, rng);
    case "lemmas_from_similar_roots": {
      if (!item.root) return [];
      const out: string[] = [];
      for (const r of similarRoots(item.root, ctx.roots, 10, rng)) {
        const candidates = (ctx.lemmasByRoot.get(r) ?? []).filter((l) => l !== correct);
        if (candidates.length === 0) continue;
        out.push(shuffle(candidates, rng)[0]);
        if (out.length === DISTRACTOR_COUNT) break;
      }
      return out;
    }
    case "pos_same_category":
      return poolDistractors(correct, ctx.posLabelsByCategory.get(item.posCategory ?? "") ?? [], DISTRACTOR_COUNT, rng);
  }
}

/** One question from one template + item, or null if no valid question can be built (e.g. no distractors). */
export function renderQuestion(
  template: LoadedTemplate,
  item: QuizItem,
  pool: QuizItem[],
  ctx: DistractorContext,
  rng: () => number
): TemplateQuestion | null {
  const { body } = template;
  if (!itemFitsTemplate(body, item)) return null;
  const correct = item[body.answerField]!;
  const distractors = pickDistractors(body, item, pool, ctx, rng);
  // Multiple choice needs at least one wrong answer; two is the floor for a
  // question that isn't a coin flip.
  if (distractors.length < 2) return null;

  const options = shuffle([correct, ...distractors], rng);
  const values: Record<string, string | undefined> = { ...item, answer: correct };
  return {
    id: `${template.code}:${item.key}`,
    templateId: template.id,
    templateCode: template.code,
    quizType: template.quizType,
    topic: body.topic,
    promptEn: fill(body.prompt.en, values),
    promptAr: body.prompt.ar ? fill(body.prompt.ar, values) : undefined,
    options,
    correctIndex: options.indexOf(correct),
    ruleReference: template.ruleReference ?? undefined,
    explanation: body.explanation ? fill(body.explanation, values) : undefined,
  };
}

/**
 * Up to `count` questions across the given templates, interleaved so a
 * session mixes question types, with no question (template + item) repeated
 * and no two consecutive questions about the same item.
 */
export function generateFromTemplates(
  templates: LoadedTemplate[],
  itemsBySource: Partial<Record<QuizSource, QuizItem[]>>,
  ctx: DistractorContext,
  count: number,
  rng: () => number
): TemplateQuestion[] {
  const queues = templates.map((t) => ({ template: t, items: shuffle(itemsBySource[t.body.source] ?? [], rng) }));
  const seen = new Set<string>();
  const out: TemplateQuestion[] = [];
  let lastItemKey: string | null = null;

  let progressed = true;
  while (out.length < count) {
    if (!progressed) {
      // A full round placed nothing. If that's only because every remaining
      // item was the one just asked about, relax the no-back-to-back rule (a
      // preference) rather than drop valid questions; otherwise we're done.
      if (lastItemKey === null || !queues.some((q) => q.items.length > 0)) break;
      lastItemKey = null;
    }
    progressed = false;
    for (const q of shuffle(queues, rng)) {
      if (out.length >= count) break;
      // Take the first item that isn't the one just asked about — that one is
      // deferred (left in the queue for a later round), not discarded.
      for (let i = 0; i < q.items.length; ) {
        const item = q.items[i];
        if (item.key === lastItemKey) {
          i++;
          continue;
        }
        q.items.splice(i, 1);
        const question = renderQuestion(q.template, item, itemsBySource[q.template.body.source] ?? [], ctx, rng);
        if (!question || seen.has(question.id)) continue;
        seen.add(question.id);
        out.push(question);
        lastItemKey = item.key;
        progressed = true;
        break;
      }
    }
  }
  return out;
}
