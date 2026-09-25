"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "text" | "root";

interface SearchResult {
  documentId: string;
  documentTitle: string;
  pageNumber: number | null;
  snippet: string;
  matchStart: number;
  matchEnd: number;
  matchCount: number;
  matchedWords?: string[];
  root?: string;
}

interface SearchResponse {
  results: SearchResult[];
  roots?: string[];
  suggestions?: { lemma: string; root: string }[];
}

export default function LibrarySearch() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("text");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search(q: string, m: Mode) {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/library/search?mode=${m}&q=${encodeURIComponent(q.trim())}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Search failed");
      setResponse(body as SearchResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
      setResponse(null);
    } finally {
      setBusy(false);
    }
  }

  function searchRoot(root: string) {
    setQuery(root);
    setMode("root");
    search(root, "root");
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(query, mode);
        }}
        className="space-y-2"
      >
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dir="rtl"
            placeholder={mode === "root" ? "A root (ك ت ب) or any word from it (يكتبون)…" : "Search your library for a word or phrase…"}
            className="flex-1 rounded-md border border-stone-300 bg-white px-4 py-2 font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-600 dark:bg-parchment-900"
          />
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
          >
            {busy ? "…" : "Search"}
          </button>
        </div>
        <div role="radiogroup" aria-label="Search mode" className="flex gap-2 text-xs">
          {(
            [
              ["text", "Exact word or phrase", "Ignores tashkeel: كتاب finds كِتَابٌ"],
              ["root", "Same root", "Every word from the root, as attested in the Qur'an"],
            ] as const
          ).map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              title={hint}
              onClick={() => setMode(value)}
              className={`rounded-lg border px-3 py-1 transition ${
                mode === value
                  ? "border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                  : "border-stone-300 text-stone-600 dark:border-stone-600 dark:text-stone-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </form>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {response && (
        <div className="space-y-2">
          {response.roots && response.roots.length > 0 && (
            <p className="text-xs text-muted">
              Root{response.roots.length > 1 ? "s" : ""}:{" "}
              {response.roots.map((r) => (
                <span key={r} dir="rtl" className="mx-1 rounded bg-stone-100 px-1.5 py-0.5 font-arabic text-sm dark:bg-stone-700">
                  {r}
                </span>
              ))}
              — forms not used in the Qur&apos;an (e.g. many modern coinages) won&apos;t be found.
            </p>
          )}

          {response.results.length === 0 ? (
            <div className="text-sm text-muted">
              {response.roots && response.roots.length === 0 ? (
                <>
                  <p>Couldn&apos;t work out a root for that word.</p>
                  {response.suggestions && response.suggestions.length > 0 && (
                    <p className="mt-1">
                      Did you mean:{" "}
                      {response.suggestions.map((s) => (
                        <button
                          key={`${s.lemma}-${s.root}`}
                          onClick={() => searchRoot(s.root)}
                          className="mx-1 rounded-lg border border-teal-600/40 px-2 py-0.5 font-arabic text-teal-800 hover:bg-teal-50 dark:text-teal-300"
                        >
                          {s.lemma} <span className="text-xs text-stone-500">({s.root})</span>
                        </button>
                      ))}
                    </p>
                  )}
                </>
              ) : (
                <p>No matches found.</p>
              )}
            </div>
          ) : (
            response.results.map((r, i) => (
              <Link
                key={i}
                href={`/library/${r.documentId}${r.pageNumber ? `?page=${r.pageNumber}` : ""}`}
                className="block rounded-md border border-stone-200 bg-white p-3 text-sm transition hover:border-teal-400 dark:border-stone-700 dark:bg-parchment-900"
              >
                <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{r.documentTitle}</span>
                  <span>
                    {r.pageNumber && `page ${r.pageNumber} · `}
                    {r.matchCount} match{r.matchCount === 1 ? "" : "es"}
                  </span>
                </div>
                <p dir="rtl" className="font-arabic leading-relaxed">
                  {r.snippet.slice(0, r.matchStart)}
                  <mark className="rounded bg-amber-200 px-0.5 dark:bg-amber-700/60 dark:text-amber-50">{r.snippet.slice(r.matchStart, r.matchEnd)}</mark>
                  {r.snippet.slice(r.matchEnd)}
                </p>
                {r.matchedWords && r.matchedWords.length > 1 && (
                  <p dir="rtl" className="mt-1 font-arabic text-xs text-stone-500">
                    {r.matchedWords.join(" · ")}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
