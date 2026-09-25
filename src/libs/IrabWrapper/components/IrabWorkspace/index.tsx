"use client";

import { useMemo, useState } from "react";
import type { DependencyEdge, IrabToken, RoleCode, SentenceAnalysis } from "@/types/irab";
import { buildIrabSentence } from "@/helpers/irab/irabSentence";

const ROLE_STYLES: Record<RoleCode, { bg: string; text: string; ring: string }> = {
  FIL: { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-800 dark:text-sky-200", ring: "ring-sky-400" },
  FAAIL: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-800 dark:text-emerald-200", ring: "ring-emerald-400" },
  MAFUL_BIH: { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-800 dark:text-purple-200", ring: "ring-purple-400" },
  MUBTADA: { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-800 dark:text-teal-200", ring: "ring-teal-400" },
  KHABAR: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-800 dark:text-amber-200", ring: "ring-amber-400" },
  HARF_JARR: { bg: "bg-rose-100 dark:bg-rose-950", text: "text-rose-800 dark:text-rose-200", ring: "ring-rose-400" },
  MAJROOR: { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-800 dark:text-indigo-200", ring: "ring-indigo-400" },
  NAAT: { bg: "bg-fuchsia-100 dark:bg-fuchsia-950", text: "text-fuchsia-800 dark:text-fuchsia-200", ring: "ring-fuchsia-400" },
  INNA: { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-800 dark:text-orange-200", ring: "ring-orange-400" },
  ISM_INNA: { bg: "bg-lime-100 dark:bg-lime-950", text: "text-lime-800 dark:text-lime-200", ring: "ring-lime-400" },
  KHABAR_INNA: { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-800 dark:text-yellow-200", ring: "ring-yellow-400" },
  KANA: { bg: "bg-sky-100 dark:bg-sky-950", text: "text-sky-800 dark:text-sky-200", ring: "ring-sky-500" },
  ISM_KANA: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-800 dark:text-emerald-200", ring: "ring-emerald-500" },
  KHABAR_KANA: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-800 dark:text-amber-200", ring: "ring-amber-500" },
  ISM_LA: { bg: "bg-lime-100 dark:bg-lime-950", text: "text-lime-800 dark:text-lime-200", ring: "ring-lime-500" },
  KHABAR_LA: { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-800 dark:text-yellow-200", ring: "ring-yellow-500" },
  NAIB_FAAIL: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-800 dark:text-emerald-200", ring: "ring-emerald-300" },
  MUDAF_ILAYH: { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-800 dark:text-violet-200", ring: "ring-violet-400" },
  MATUF: { bg: "bg-cyan-100 dark:bg-cyan-950", text: "text-cyan-800 dark:text-cyan-200", ring: "ring-cyan-400" },
  BADAL: { bg: "bg-pink-100 dark:bg-pink-950", text: "text-pink-800 dark:text-pink-200", ring: "ring-pink-400" },
  MAFUL_MUTLAQ: { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-800 dark:text-purple-200", ring: "ring-purple-500" },
  HAL: { bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-800 dark:text-orange-200", ring: "ring-orange-300" },
  TAMYIZ: { bg: "bg-teal-50 dark:bg-teal-950", text: "text-teal-800 dark:text-teal-200", ring: "ring-teal-300" },
  MAFUL_FIH: { bg: "bg-sky-50 dark:bg-sky-950", text: "text-sky-800 dark:text-sky-200", ring: "ring-sky-300" },
  HARF: { bg: "bg-stone-100 dark:bg-stone-800", text: "text-stone-700 dark:text-stone-200", ring: "ring-stone-400" },
};

const FALLBACK_STYLE = { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-800 dark:text-neutral-200", ring: "ring-neutral-400" };

interface TreeLayout {
  positions: Map<number, { x: number; y: number }>;
  nodeWidth: number;
  nodeHeight: number;
  width: number;
  height: number;
}

function buildTreeLayout(tokens: IrabToken[], edges: DependencyEdge[]): TreeLayout {
  const childrenByHead = new Map<number, number[]>();
  for (const edge of edges) {
    if (edge.headTokenId !== null) {
      const siblings = childrenByHead.get(edge.headTokenId) ?? [];
      siblings.push(edge.tokenId);
      childrenByHead.set(edge.headTokenId, siblings);
    }
  }

  const roots = edges.filter((edge) => edge.headTokenId === null).map((edge) => edge.tokenId);
  const depthByToken = new Map<number, number>();
  const queue = [...roots];
  roots.forEach((id) => depthByToken.set(id, 0));
  while (queue.length > 0) {
    const id = queue.shift() as number;
    const depth = depthByToken.get(id) ?? 0;
    for (const childId of childrenByHead.get(id) ?? []) {
      depthByToken.set(childId, depth + 1);
      queue.push(childId);
    }
  }

  const maxDepth = Math.max(0, ...Array.from(depthByToken.values()));
  const levels: number[][] = Array.from({ length: maxDepth + 1 }, () => []);
  for (const token of tokens) {
    levels[depthByToken.get(token.id) ?? 0].push(token.id);
  }

  const positionInUnitById = new Map(tokens.map((token) => [token.id, token.positionInUnit]));
  // Sort each level right-to-left by sentence position so the tree lines up
  // visually beneath the RTL sentence rendered above it.
  levels.forEach((level) => level.sort((a, b) => (positionInUnitById.get(b) ?? 0) - (positionInUnitById.get(a) ?? 0)));

  const nodeWidth = 150;
  const nodeHeight = 56;
  const hGap = 30;
  const vGap = 64;

  const positions = new Map<number, { x: number; y: number }>();
  let maxRowWidth = 0;
  levels.forEach((level, depth) => {
    const rowWidth = level.length * nodeWidth + (level.length - 1) * hGap;
    maxRowWidth = Math.max(maxRowWidth, rowWidth);
    level.forEach((id, index) => {
      positions.set(id, { x: index * (nodeWidth + hGap), y: depth * (nodeHeight + vGap) });
    });
  });
  levels.forEach((level) => {
    const rowWidth = level.length * nodeWidth + (level.length - 1) * hGap;
    const offset = (maxRowWidth - rowWidth) / 2;
    level.forEach((id) => {
      const p = positions.get(id);
      if (p) positions.set(id, { x: p.x + offset, y: p.y });
    });
  });

  return {
    positions,
    nodeWidth,
    nodeHeight,
    width: maxRowWidth + 20,
    height: (maxDepth + 1) * (nodeHeight + vGap) - vGap + nodeHeight,
  };
}

export default function IrabWorkspace({ sentence }: { sentence: SentenceAnalysis }) {
  const [selectedTokenId, setSelectedTokenId] = useState<number>(sentence.tokens[0]?.id);

  const edgeByToken = useMemo(() => new Map(sentence.edges.map((edge) => [edge.tokenId, edge])), [sentence.edges]);
  const layout = useMemo(() => buildTreeLayout(sentence.tokens, sentence.edges), [sentence.tokens, sentence.edges]);

  const styleFor = (roleCode?: RoleCode) => (roleCode ? ROLE_STYLES[roleCode] ?? FALLBACK_STYLE : FALLBACK_STYLE);

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Color-coded sentence */}
      <section>
        <p className="mb-2 text-sm text-muted">{sentence.sourceLabel}</p>
        <div
          dir="rtl"
          className="arabic-display flex flex-wrap items-baseline gap-3 rounded-lg border border-amber-200/60 bg-parchment-100 p-6 leading-loose dark:border-amber-900/40 dark:bg-parchment-900"
        >
          {sentence.tokens
            .slice()
            .sort((a, b) => a.positionInUnit - b.positionInUnit)
            .map((token) => {
              const role = edgeByToken.get(token.id)?.role;
              const style = styleFor(role?.code);
              const isSelected = selectedTokenId === token.id;
              return (
                <button
                  key={token.id}
                  onClick={() => setSelectedTokenId(token.id)}
                  className={`rounded-lg px-2 py-1 font-arabic transition ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 ${style.bg} ${style.text} ${
                    isSelected ? style.ring : "ring-transparent"
                  }`}
                >
                  {token.surfaceForm}
                </button>
              );
            })}
        </div>
        {sentence.translationEn && (
          <p className="mt-2 text-sm text-muted">
            {sentence.translationEn}
            {sentence.translationSource === "gemini" && (
              <span className="ml-1.5 text-xs text-purple-600 dark:text-purple-400">(AI-suggested translation — unverified)</span>
            )}
          </p>
        )}
      </section>

      {/* 2. Expandable token cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sentence.tokens
          .slice()
          .sort((a, b) => a.positionInUnit - b.positionInUnit)
          .map((token) => {
            const edge = edgeByToken.get(token.id);
            const style = styleFor(edge?.role.code);
            const isSelected = selectedTokenId === token.id;
            const irabSentence = buildIrabSentence(token, edge?.role);
            return (
              <button
                key={token.id}
                onClick={() => setSelectedTokenId(token.id)}
                className={`rounded-md border bg-white p-4 text-left transition dark:bg-parchment-800 ${
                  isSelected ? `border-transparent ring-2 ${style.ring} ${style.bg}` : "border-border"
                }`}
              >
                <div dir="rtl" className="font-arabic text-2xl mb-2">
                  {token.surfaceForm}
                </div>
                <dl className="text-sm space-y-1">
                  <Row label="Root" value={token.root} arabic />
                  <Row label="Lemma" value={token.lemma} arabic />
                  <Row label="POS" value={`${token.posNameEn} (${token.posNameAr})`} />
                  {token.caseSign && <Row label="Case sign" value={`${token.caseSign.signEn} (${token.caseSign.signAr})`} />}
                  {edge && <Row label="Role" value={`${edge.role.nameEn} (${edge.role.nameAr})`} />}
                  {edge?.role.ruleReference && <Row label="Rule" value={edge.role.ruleReference} />}
                </dl>
                {irabSentence && (
                  <div className="mt-3 space-y-1.5 border-t border-stone-200 pt-3 text-sm dark:border-stone-700/60">
                    <p dir="rtl" className="font-arabic text-lg leading-relaxed text-emerald-900 dark:text-amber-200">
                      {irabSentence.ar}
                    </p>
                    <p className="italic text-muted">{irabSentence.transliteration}</p>
                    <p className="text-muted">{irabSentence.en}</p>
                  </div>
                )}
              </button>
            );
          })}
      </section>

      {/* 3. Dependency tree diagram */}
      <section>
        <h3 className="mb-3 text-sm font-medium text-muted">Dependency tree</h3>
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width="100%"
          className="max-w-2xl"
          style={{ height: layout.height }}
        >
          {sentence.edges
            .filter((edge) => edge.headTokenId !== null)
            .map((edge) => {
              const from = layout.positions.get(edge.headTokenId as number);
              const to = layout.positions.get(edge.tokenId);
              if (!from || !to) return null;
              const x1 = from.x + layout.nodeWidth / 2;
              const y1 = from.y + layout.nodeHeight;
              const x2 = to.x + layout.nodeWidth / 2;
              const y2 = to.y;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;
              return (
                <g key={`edge-${edge.tokenId}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-neutral-400 dark:stroke-neutral-600" strokeWidth={1.5} />
                  <rect x={midX - 45} y={midY - 11} width={90} height={20} rx={4} className="fill-white dark:fill-neutral-950" />
                  <text x={midX} y={midY + 4} textAnchor="middle" className="fill-neutral-600 dark:fill-neutral-400 text-[11px]">
                    {edge.role.nameEn}
                  </text>
                </g>
              );
            })}
          {sentence.tokens.map((token) => {
            const pos = layout.positions.get(token.id);
            if (!pos) return null;
            const role = edgeByToken.get(token.id)?.role;
            const style = styleFor(role?.code);
            return (
              <foreignObject key={token.id} x={pos.x} y={pos.y} width={layout.nodeWidth} height={layout.nodeHeight}>
                <div
                  dir="rtl"
                  className={`flex h-full w-full flex-col items-center justify-center rounded-lg font-arabic text-lg ${style.bg} ${style.text}`}
                >
                  {token.surfaceForm}
                  {token.caseSign && <span className="text-[10px] opacity-70">{token.caseSign.signEn}</span>}
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </section>
    </div>
  );
}

function Row({ label, value, arabic }: { label: string; value: string; arabic?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-neutral-500">{label}</dt>
      <dd dir={arabic ? "rtl" : undefined} className={arabic ? "font-arabic" : undefined}>
        {value}
      </dd>
    </div>
  );
}
