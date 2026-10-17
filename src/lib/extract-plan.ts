export type PageKind = "text" | "scanned";

export interface PageClassification {
  index: number; // 1-based
  kind: PageKind;
  textChars: number;
}

export interface ExtractPlan {
  mode: "text" | "ocr" | "mixed";
  textPageIndexes: number[];
  ocrPageIndexes: number[];
  skipped: number;
  notice: string | null;
}

const TEXT_CHAR_THRESHOLD = 80;

export function classifyPageText(raw: string): PageKind {
  const chars = raw.replace(/\s/g, "").length;
  return chars >= TEXT_CHAR_THRESHOLD ? "text" : "scanned";
}

/**
 * Free trial: text pages 1–3 OR a single first scanned page.
 * Mixed PDFs never silently OCR extra pages on the trial.
 */
export function planTrialExtraction(
  pages: PageClassification[],
  maxTextPages: number,
  maxOcrPages: number
): ExtractPlan {
  if (!pages.length) {
    return { mode: "text", textPageIndexes: [], ocrPageIndexes: [], skipped: 0, notice: "Couldn’t read this PDF." };
  }
  const first = pages[0];
  if (first.kind === "scanned") {
    const ocr = pages.slice(0, maxOcrPages).filter((p) => p.kind === "scanned").map((p) => p.index);
    const skipped = Math.max(0, pages.length - ocr.length);
    return {
      mode: "ocr",
      textPageIndexes: [],
      ocrPageIndexes: ocr,
      skipped,
      notice:
        skipped > 0
          ? "Free trial includes 1 scanned page. Later pages were not processed."
          : null,
    };
  }
  const text: number[] = [];
  for (const page of pages) {
    if (page.kind !== "text") break;
    if (text.length >= maxTextPages) break;
    text.push(page.index);
  }
  const skipped = Math.max(0, pages.length - text.length);
  return {
    mode: text.length && skipped && pages.some((p) => p.kind === "scanned") ? "mixed" : "text",
    textPageIndexes: text,
    ocrPageIndexes: [],
    skipped,
    notice:
      skipped > 0
        ? "Free trial includes the first 3 text pages. Scanned or extra pages were not processed."
        : null,
  };
}

export function planPaidExtraction(pages: PageClassification[], maxPages: number): ExtractPlan {
  const limited = pages.slice(0, maxPages);
  const textPageIndexes = limited.filter((p) => p.kind === "text").map((p) => p.index);
  const ocrPageIndexes = limited.filter((p) => p.kind === "scanned").map((p) => p.index);
  const skipped = Math.max(0, pages.length - limited.length);
  const mode =
    ocrPageIndexes.length && textPageIndexes.length ? "mixed" : ocrPageIndexes.length ? "ocr" : "text";
  return {
    mode,
    textPageIndexes,
    ocrPageIndexes,
    skipped,
    notice: skipped > 0 ? `Only the first ${maxPages} pages can be processed.` : null,
  };
}

export function splitDocumentChunks(text: string, budget: number, overlap: number): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= budget) return [normalized];
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(normalized.length, start + budget);
    if (end < normalized.length) {
      const window = normalized.slice(start, end);
      const breakAt = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf("\n"));
      if (breakAt > budget * 0.4) end = start + breakAt;
    }
    chunks.push(normalized.slice(start, end));
    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}
