"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LibraryUpload() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) formData.append("title", title.trim());
      if (author.trim()) formData.append("author", author.trim());

      const res = await fetch("/api/library", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");

      setFile(null);
      setTitle("");
      setAuthor("");
      router.refresh();
      // Scanned pages are being transcribed in the background (202) — keep
      // the form open with that notice visible; otherwise we're done.
      if (body.notice) setNotice(body.notice);
      else setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
      >
        Upload document
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-3 rounded-lg border border-stone-200 bg-white p-5 dark:border-stone-700/60 dark:bg-parchment-800">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Upload a PDF</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
          Cancel
        </button>
      </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        required
        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white dark:text-stone-300"
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (defaults to filename)"
        className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-600 dark:bg-parchment-900"
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author (optional)"
        className="w-full rounded-md border border-stone-300 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-600 dark:bg-parchment-900"
      />
      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      {notice && (
        <p className="rounded-lg border border-teal-300 bg-teal-50 p-2 text-xs text-teal-900 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200">
          {notice}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !file}
        className="w-full rounded-md bg-teal-700 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
      >
        {busy ? "Reading PDF…" : "Upload & extract"}
      </button>
    </form>
  );
}
