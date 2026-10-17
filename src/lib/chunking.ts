export interface TextChunk {
  seq: number;
  text: string;
}

const TARGET_CHARS = 12000;
const OVERLAP_LINES = 4;

export function splitExtractedText(text: string): TextChunk[] {
  const lines = text.split(/\r?\n/);
  const chunks: TextChunk[] = [];
  let buf: string[] = [];
  let size = 0;
  let seq = 0;
  const flush = (overlap = true) => {
    if (!buf.length) return;
    chunks.push({ seq, text: buf.join("\n") });
    seq += 1;
    if (overlap) {
      buf = buf.slice(-OVERLAP_LINES);
      size = buf.join("\n").length;
    } else {
      buf = [];
      size = 0;
    }
  };
  for (const line of lines) {
    if (size + line.length > TARGET_CHARS && buf.length) flush(true);
    buf.push(line);
    size += line.length + 1;
  }
  flush(false);
  if (!chunks.length) chunks.push({ seq: 0, text });
  return chunks;
}

export type RawTx = {
  date?: string;
  description?: string;
  debit?: number | string;
  credit?: number | string;
  balance?: number | string;
  cheque_number?: string;
  category?: string | null;
  uncertain?: boolean;
};

function txKey(tx: RawTx): string {
  const d = String(tx.date || "").trim();
  const desc = String(tx.description || "").trim().slice(0, 80);
  const debit = String(tx.debit ?? "");
  const credit = String(tx.credit ?? "");
  return `${d}|${desc}|${debit}|${credit}`;
}

/** Keep overlap duplicates from adjacent chunks; do not drop legitimate same-day repeats later in the statement. */
export function mergeChunkTransactions(parts: RawTx[][]): { transactions: RawTx[]; notices: string[] } {
  const notices: string[] = [];
  const out: RawTx[] = [];
  const recent = new Set<string>();
  for (let i = 0; i < parts.length; i++) {
    const rows = parts[i] || [];
    const nextKeys = new Set<string>();
    for (const tx of rows) {
      const key = txKey(tx);
      if (i > 0 && recent.has(key)) continue;
      out.push(tx);
      nextKeys.add(key);
    }
    recent.clear();
    nextKeys.forEach((key) => recent.add(key));
  }
  return { transactions: out, notices };
}

export function validateTransactions(rows: RawTx[]): string[] {
  const notices: string[] = [];

  // Detect decimal precision from amount values
  function detectPrecision(values: (number | string | undefined)[]): number {
    for (const v of values) {
      if (v == null || v === "") continue;
      const s = String(v);
      const dot = s.indexOf(".");
      if (dot !== -1) return s.length - dot - 1;
    }
    return 2; // default to 2 decimal places
  }

  const allAmounts = rows.flatMap((r) => [r.debit, r.credit, r.balance]);
  const precision = detectPrecision(allAmounts);
  const tolerance = 0.5 * Math.pow(10, -precision);
  const precisionKnown = allAmounts.some((v) => v != null && v !== "" && String(v).includes("."));

  if (!precisionKnown) {
    notices.push("Balance precision could not be determined; check highlighted rows.");
  }

  let lastBal: number | null = null;
  for (const tx of rows) {
    const debit = Number(tx.debit) || 0;
    const credit = Number(tx.credit) || 0;
    const bal = tx.balance == null || tx.balance === "" ? null : Number(tx.balance);
    if (!tx.date) notices.push("Some rows are missing dates.");
    if (debit && credit) {
      tx.uncertain = true;
      notices.push("A row has both debit and credit; left unchanged.");
    }
    if (bal != null && !Number.isNaN(bal) && lastBal != null) {
      const expected = lastBal + credit - debit;
      if (Math.abs(expected - bal) > tolerance) {
        tx.uncertain = true;
      }
    }
    if (bal != null && !Number.isNaN(bal)) lastBal = bal;
  }
  if (rows.some((r) => r.uncertain)) {
    notices.push("Some amounts could not be fully verified. Check highlighted rows.");
  }
  return Array.from(new Set(notices));
}
