/** Splits a sentence into words on whitespace, stripping common trailing/leading punctuation. */
export function tokenizeSentence(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/^[.,!?؟،؛:"'“”()\-]+|[.,!?؟،؛:"'“”()\-]+$/g, ""))
    .filter((w) => w.length > 0);
}
