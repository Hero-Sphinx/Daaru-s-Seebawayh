"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MobileSheet, XIcon } from "@/components";
import { isArabicWord, isMostlyArabic, rangesOverlap } from "@/helpers";
import type { AnnotationDTO, MorphCandidate, ReaderPage as Page } from "@/types";

interface WordLookupResult {
  arabicWord: string;
  meaningEn: string | null;
  aiAssisted: boolean;
  camelCandidates: MorphCandidate[];
  /** From parsing the word's actual sentence (see fetchRole) — only ever set when the deterministic parser could resolve it; real book text is usually undiacritized, so this is often absent, and that's correct, not a bug. */
  role?: { nameEn: string; nameAr: string; caseSignEn: string; caseSignAr: string };
}

const STRIP_PUNCTUATION_RE = /^[.,!?؟،؛:"'“”()\-]+|[.,!?؟،؛:"'“”()\-]+$/g;

/**
 * Renders mixed-language page text with each word individually direction-
 * and font-aware, and only Arabic words clickable — a non-Arabic word (or
 * an entirely English page) has no morphology to look up, so making it a
 * button did nothing useful and forcing the whole page RTL made English
 * content look wrong. The paragraph's own `dir` follows whichever script
 * dominates the page, so a mostly-English page still reads left-to-right.
 *
 * Split into sentence-like chunks first (on newlines/sentence-final
 * punctuation, using a lookbehind so every original character — including
 * whitespace and the delimiters themselves — still renders exactly as
 * before) so each word's click handler can carry its actual sentence, not
 * just the bare word — that's what lets the lookup panel attempt a
 * grammatical role, not just isolated root/lemma/POS.
 */
function ClickableArabicText({
  text,
  onWordClick,
  highlights,
  selectable,
}: {
  text: string;
  onWordClick: (word: string, sentence: string) => void;
  /** [start, end) ranges in `text` covered by notes — words inside are tinted. */
  highlights: { start: number; end: number }[];
  /** Annotate mode: plain selectable spans (text inside buttons can't be drag-selected reliably). */
  selectable: boolean;
}) {
  const pageDir = isMostlyArabic(text) ? "rtl" : "ltr";
  return (
    <p dir={pageDir} className="text-2xl leading-loose text-stone-800 dark:text-amber-100">
      {splitWithOffsets(text).map(({ part, start, sentence, key }) => {
        const tinted = highlights.some((h) => rangesOverlap(start, start + part.length, h.start, h.end))
          ? "bg-amber-200/70 dark:bg-amber-700/40"
          : "";
        if (/^\s+$/.test(part)) {
          return (
            <span key={key} data-offset={start} className={tinted}>
              {part}
            </span>
          );
        }
        const arabic = isArabicWord(part);
        if (!arabic || selectable) {
          return (
            <span key={key} data-offset={start} dir={arabic ? "rtl" : undefined} className={`${arabic ? "font-arabic" : "px-0.5"} ${tinted}`}>
              {part}
            </span>
          );
        }
        return (
          <button
            key={key}
            dir="rtl"
            onClick={() => onWordClick(part.replace(STRIP_PUNCTUATION_RE, ""), sentence)}
            className={`rounded px-0.5 font-arabic transition hover:bg-emerald-100 dark:hover:bg-emerald-900/40 ${tinted}`}
          >
            {part}
          </button>
        );
      })}
    </p>
  );
}

/**
 * Splits page text into sentence-aware pieces (words and whitespace runs),
 * each with its start offset in `text`. The pieces partition `text`
 * exactly — that's what lets a DOM selection map back to annotation offsets
 * via data-offset. Pure, computed before render (no mutation during render).
 */
function splitWithOffsets(text: string): { part: string; start: number; sentence: string; key: string }[] {
  const out: { part: string; start: number; sentence: string; key: string }[] = [];
  let offset = 0;
  text.split(/(?<=[\n.!?؟])/).forEach((chunk, ci) => {
    const sentence = chunk.trim();
    chunk.split(/(\s+)/).forEach((part, i) => {
      if (part !== "") out.push({ part, start: offset, sentence, key: `${ci}-${i}` });
      offset += part.length;
    });
  });
  return out;
}

/** Maps the current DOM selection inside `container` to [start, end) offsets in the page text, via data-offset spans. */
function selectionOffsets(container: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  const toOffset = (node: Node, nodeOffset: number): number | null => {
    const el = (node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element))?.closest("[data-offset]");
    if (!el || !container.contains(el)) return null;
    return Number((el as HTMLElement).dataset.offset) + (node.nodeType === Node.TEXT_NODE ? nodeOffset : 0);
  };
  const a = toOffset(range.startContainer, range.startOffset);
  const b = toOffset(range.endContainer, range.endOffset);
  if (a === null || b === null) return null;
  return { start: Math.min(a, b), end: Math.max(a, b) };
}

function WordLookupPanel({
  word,
  result,
  loading,
  error,
  onClose,
  onShowMeaning,
  meaningLoading,
}: {
  word: string;
  result: WordLookupResult | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onShowMeaning: () => void;
  meaningLoading: boolean;
}) {
  const candidates = result?.camelCandidates ?? null;
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <div className="mb-2 flex items-center justify-between">
        <span dir="rtl" className="font-arabic text-xl font-bold text-emerald-900 dark:text-amber-200">
          {word}
        </span>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      {loading && <p className="text-xs text-muted">Looking up morphology…</p>}
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {result?.meaningEn && (
        <p className="mb-2 text-sm text-stone-700 dark:text-stone-200">
          {result.meaningEn}
          {result.aiAssisted && <span className="ml-1.5 text-xs text-purple-600 dark:text-purple-400">(AI-suggested — unverified)</span>}
        </p>
      )}
      {result && !result.meaningEn && (
        <button type="button" onClick={onShowMeaning} disabled={meaningLoading} className="mb-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-foreground transition hover:border-brand/40 disabled:opacity-60">
          {meaningLoading ? "Looking up meaning…" : "Show meaning (AI-suggested)"}
        </button>
      )}
      {result?.role ? (
        <p className="mb-2 rounded-lg border border-emerald-300 bg-emerald-100/60 px-2.5 py-1.5 text-xs dark:border-emerald-800 dark:bg-emerald-950/40">
          <span className="font-semibold text-emerald-800 dark:text-emerald-200">
            {result.role.nameEn} ({result.role.nameAr})
          </span>
          <span className="text-muted">
            {" "}
            — {result.role.caseSignEn} ({result.role.caseSignAr})
          </span>
        </p>
      ) : (
        !loading &&
        result && (
          <p className="mb-2 text-[11px] text-stone-400 dark:text-stone-500">
            Grammatical role not shown — this sentence isn&apos;t fully diacritized or doesn&apos;t match a supported
            pattern, so it can&apos;t be determined without guessing.
          </p>
        )
      )}
      {candidates && candidates.length === 0 && (
        <p className="text-xs text-muted">No morphological analysis found for this word.</p>
      )}
      {candidates && candidates.length > 0 && (
        <div className="space-y-2">
          {candidates.length > 1 && (
            <p className="text-xs text-muted">
              {candidates.length} possible readings (undiacritized text is often ambiguous):
            </p>
          )}
          {candidates.map((c, i) => (
            <dl key={i} className="grid grid-cols-2 gap-x-2 gap-y-1 rounded-lg border border-stone-200 bg-white p-2 text-xs dark:border-stone-700 dark:bg-parchment-900">
              <dt className="text-muted">Root</dt>
              <dd dir="rtl" className="font-arabic">
                {c.root ?? "—"}
              </dd>
              <dt className="text-muted">Lemma</dt>
              <dd dir="rtl" className="font-arabic">
                {c.lemma ?? "—"}
              </dd>
              <dt className="text-muted">POS</dt>
              <dd>{c.pos ?? "—"}</dd>
            </dl>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LibraryReader({
  pages,
  documentId,
  annotations,
  canAnnotate,
  isOwner,
  initialPageIndex = 0,
}: {
  pages: Page[];
  documentId: string;
  /** Every note this user may see on the document (own + others' shared). */
  annotations: AnnotationDTO[];
  canAnnotate: boolean;
  isOwner: boolean;
  initialPageIndex?: number;
}) {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(() => Math.min(Math.max(initialPageIndex, 0), Math.max(pages.length - 1, 0)));
  const [lookupWord, setLookupWord] = useState<string | null>(null);
  const [result, setResult] = useState<WordLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meaningLoading, setMeaningLoading] = useState(false);
  const [annotating, setAnnotating] = useState(false);
  const [draft, setDraft] = useState<{ start: number; end: number; quote: string } | null>(null);
  const closeSheet = useCallback(() => {
    setLookupWord(null);
    setDraft(null);
  }, []);

  const page = pages[pageIndex];
  const pageNotes = page ? annotations.filter((a) => a.textUnitId === page.id) : [];

  function goToPage(i: number) {
    setPageIndex(i);
    setDraft(null);
  }

  function captureSelection(container: HTMLElement) {
    if (!annotating || !page) return;
    const sel = selectionOffsets(container);
    if (!sel) return;
    const quote = page.text.slice(sel.start, sel.end).trim();
    if (quote) setDraft({ ...sel, quote });
  }

  async function showMeaning() {
    if (!lookupWord || !result) return;
    const word = lookupWord;
    setMeaningLoading(true);
    try {
      const res = await fetch("/api/vocabulary/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: word, withMeaning: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Meaning lookup failed");
      if (!body.meaningEn) throw new Error("No meaning available right now (the AI service may be unconfigured or out of quota).");
      setResult((r) => (r && lookupWord === word ? { ...r, meaningEn: body.meaningEn, aiAssisted: body.aiAssisted ?? true } : r));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Meaning lookup failed");
    } finally {
      setMeaningLoading(false);
    }
  }

  async function handleWordClick(word: string, sentence: string) {
    if (!word) return;
    setLookupWord(word);
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      // Two independent lookups, run in parallel:
      // 1. /api/vocabulary/lookup — CAMeL root/lemma/POS only (withMeaning:
      //    false): the Gemini meaning is fetched when the learner asks for
      //    it (showMeaning below), so reading a page doesn't spend the
      //    daily AI quota word by word. A meaning already cached comes back
      //    anyway, free.
      // 2. /api/irab/parse on the word's actual sentence — the same
      //    deterministic parser the I'rab Workspace uses, so a click can
      //    show the word's grammatical role, not just isolated morphology.
      //    includeTranslation: false so this never costs Gemini quota — a
      //    reader click shouldn't compete with the app's other AI features
      //    for the same small daily budget. Real book text is usually
      //    undiacritized, so this will often resolve nothing — that's the
      //    parser correctly declining to guess, not a bug; role is simply
      //    omitted when it can't be determined.
      const [lookupSettled, roleSettled] = await Promise.allSettled([
        fetch("/api/vocabulary/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: word, withMeaning: false }),
        }).then(async (res) => {
          const body = await res.json();
          if (!res.ok) throw new Error(body.error ?? "Lookup failed");
          return body;
        }),
        fetch("/api/irab/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: sentence, includeTranslation: false }),
        }).then(async (res) => (res.ok ? res.json() : null)),
      ]);

      if (lookupSettled.status === "rejected") {
        throw lookupSettled.reason instanceof Error ? lookupSettled.reason : new Error("Lookup failed");
      }
      const lookupBody = lookupSettled.value;

      let role: WordLookupResult["role"];
      if (roleSettled.status === "fulfilled" && roleSettled.value) {
        const parsed = roleSettled.value.sentence;
        const token = parsed?.tokens.find((t: { surfaceForm: string }) => t.surfaceForm === word);
        const edge = token && parsed.edges.find((e: { tokenId: number }) => e.tokenId === token.id);
        if (token && edge && token.caseSign) {
          role = { nameEn: edge.role.nameEn, nameAr: edge.role.nameAr, caseSignEn: token.caseSign.signEn, caseSignAr: token.caseSign.signAr };
        }
      }

      setResult({
        arabicWord: lookupBody.arabicWord,
        meaningEn: lookupBody.meaningEn ?? null,
        aiAssisted: lookupBody.aiAssisted ?? false,
        camelCandidates: lookupBody.camelCandidates ?? [],
        role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  if (pages.length === 0) {
    return <p className="text-sm text-muted">No readable text was extracted from this document.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => goToPage(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            className="flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-1.5 text-stone-600 transition hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-700 dark:text-stone-300"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Prev
          </button>
          <span className="text-muted">
            Page {page.pageNumber ?? pageIndex + 1} of {pages.length}
          </span>
          <button
            onClick={() => goToPage(Math.min(pages.length - 1, pageIndex + 1))}
            disabled={pageIndex === pages.length - 1}
            className="flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-1.5 text-stone-600 transition hover:bg-stone-200 disabled:opacity-40 dark:bg-stone-700 dark:text-stone-300"
          >
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        {page.isOcr && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            This page had no text layer in the PDF (scanned/image page) — the text below was transcribed by Gemini (OCR),
            not extracted directly, and may contain misreadings, especially diacritics.
          </p>
        )}
        {canAnnotate && (
          <div className="flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setAnnotating((a) => !a);
                setDraft(null);
              }}
              aria-pressed={annotating}
              className={`rounded-lg border px-3 py-1.5 font-medium transition ${
                annotating
                  ? "border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                  : "border-stone-300 text-stone-600 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300"
              }`}
            >
              {annotating ? "Done annotating" : "Highlight & add notes"}
            </button>
          </div>
        )}
        <div
          onMouseUp={(e) => captureSelection(e.currentTarget)}
          onTouchEnd={(e) => captureSelection(e.currentTarget)}
          className={`rounded-lg border bg-parchment-50 p-6 dark:bg-parchment-900 ${
            annotating ? "border-amber-400 dark:border-amber-700" : "border-border"
          }`}
        >
          <ClickableArabicText
            text={page.text}
            onWordClick={handleWordClick}
            highlights={pageNotes.map((a) => ({ start: a.start, end: a.end }))}
            selectable={annotating}
          />
        </div>
        <p className="text-xs text-stone-400">
          {annotating
            ? "Select a passage with your mouse (or finger) to highlight it and attach a note."
            : "Click any word for its root, lemma, part of speech, and meaning — plus its grammatical role when the sentence is diacritized enough to determine one."}
        </p>
      </div>

      <aside className="space-y-4">
        {/* The tapped word's details and the note being written: a bottom sheet on phones, the side column on large screens. */}
        <MobileSheet
          open={lookupWord !== null || draft !== null}
          onClose={closeSheet}
          title={draft ? "New note" : "Word details"}
        >
        <div className="space-y-4">
        {draft && (
          <NoteForm
            documentId={documentId}
            textUnitId={page.id}
            draft={draft}
            onDone={() => {
              setDraft(null);
              window.getSelection()?.removeAllRanges();
              router.refresh();
            }}
            onCancel={() => setDraft(null)}
          />
        )}
        {lookupWord ? (
          <WordLookupPanel
            word={lookupWord}
            result={result}
            loading={loading}
            error={error}
            onClose={() => setLookupWord(null)}
            onShowMeaning={showMeaning}
            meaningLoading={meaningLoading}
          />
        ) : (
          !annotating && (
            <div className="rounded-lg border border-stone-200 bg-white p-4 text-xs text-stone-500 dark:border-stone-700/60 dark:bg-parchment-800 dark:text-stone-400">
              Click a word in the text to see its morphological breakdown here.
            </div>
          )
        )}
        </div>
        </MobileSheet>
        <NotesList documentId={documentId} notes={pageNotes} isOwner={isOwner} onChanged={() => router.refresh()} />
      </aside>
    </div>
  );
}

function NoteForm({
  documentId,
  textUnitId,
  draft,
  onDone,
  onCancel,
}: {
  documentId: string;
  textUnitId: number;
  draft: { start: number; end: number; quote: string };
  onDone: () => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"shared" | "private">("shared");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/${documentId}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textUnitId, start: draft.start, end: draft.end, note, visibility }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't save the note");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
      <p dir="rtl" className="line-clamp-3 font-arabic text-base">&ldquo;{draft.quote}&rdquo;</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Your note (optional) — a translation, a grammar point, a question…"
        className="w-full rounded-lg border border-stone-300 bg-white p-2 text-sm dark:border-stone-600 dark:bg-parchment-900"
      />
      <div className="flex items-center justify-between gap-2">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as "shared" | "private")}
          className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs dark:border-stone-600 dark:bg-parchment-900"
        >
          <option value="shared">Visible to everyone with access</option>
          <option value="private">Only me</option>
        </select>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="text-xs text-stone-500 hover:underline">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save highlight"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function NotesList({
  documentId,
  notes,
  isOwner,
  onChanged,
}: {
  documentId: string;
  notes: AnnotationDTO[];
  isOwner: boolean;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  if (notes.length === 0) return null;

  async function remove(id: string) {
    setError(null);
    const res = await fetch(`/api/library/${documentId}/annotations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't delete the note");
      return;
    }
    onChanged();
  }

  return (
    <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700/60 dark:bg-parchment-800">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Notes on this page ({notes.length})</h3>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="border-l-2 border-amber-400 pl-3 text-sm">
            <p dir="rtl" className="font-arabic text-stone-700 dark:text-stone-200">&ldquo;{n.quote}&rdquo;</p>
            {n.note && <p className="mt-1 whitespace-pre-wrap">{n.note}</p>}
            <p className="mt-1 flex items-center gap-2 text-[11px] text-stone-500">
              <span>{n.mine ? "You" : n.authorName}</span>
              {n.visibility === "private" && <span className="rounded bg-stone-200 px-1 dark:bg-stone-700">private</span>}
              {(n.mine || isOwner) && (
                <button type="button" onClick={() => remove(n.id)} className="text-rose-600 hover:underline">
                  Delete
                </button>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
