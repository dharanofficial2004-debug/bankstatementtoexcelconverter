import { Transaction } from "./types";

/**
 * Converts an amount string like "1,234.56" → "1234.56"
 * Returns "0.00" if empty or unparseable.
 */
function toIifAmount(raw: string | undefined | null): string {
  if (!raw) return "0.00";
  const num = parseFloat(String(raw).replace(/,/g, ""));
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}

/**
 * Converts a date string (YYYY-MM-DD or DD/MM/YYYY or MM/DD/YYYY)
 * to MM/DD/YYYY which QuickBooks IIF expects.
 */
function toIifDate(raw: string | undefined | null): string {
  if (!raw) return "";

  // Already MM/DD/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;

  // YYYY-MM-DD  (ISO format — what Gemini returns)
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, yyyy, mm, dd] = iso;
    return `${mm}/${dd}/${yyyy}`;
  }

  // DD/MM/YYYY  →  MM/DD/YYYY
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return `${mm}/${dd}/${yyyy}`;
  }

  // Fallback — return as-is
  return raw;
}

/**
 * Exports transactions to QuickBooks IIF format.
 *
 * Structure:
 *   !TRNS  header row (once)
 *   !SPL   header row (once)
 *   !ENDTRNS
 *   TRNS   data
 *   SPL    data (offsetting entry to "Uncategorized")
 *   ENDTRNS
 */
export function exportToIif(transactions: Transaction[]): string {
  const ACCOUNT = "Checking";
  const SPLIT_ACCOUNT = "Uncategorized";
  const TRNS_TYPE = "GENERAL JOURNAL";

  const lines: string[] = [];

  // Header rows — printed once
  lines.push(
    [
      "!TRNS",
      "TRNSID",
      "TRNSTYPE",
      "DATE",
      "ACCNT",
      "NAME",
      "AMOUNT",
      "MEMO",
    ].join("\t")
  );
  lines.push(
    ["!SPL", "SPLID", "TRNSTYPE", "DATE", "ACCNT", "NAME", "AMOUNT", "MEMO"].join("\t")
  );
  lines.push("!ENDTRNS");

  transactions.forEach((tx, idx) => {
    const date = toIifDate(tx.date);
    const memo = (tx.description || "").replace(/\t/g, " "); // tabs break IIF

    const debit = parseFloat(toIifAmount(tx.debit));
    const credit = parseFloat(toIifAmount(tx.credit));

    // Net amount from the account's perspective:
    //   credit → money coming IN  → positive
    //   debit  → money going OUT  → negative
    const trnsAmount = credit > 0 ? credit : -debit;
    const splAmount = -trnsAmount; // offsetting entry

    // TRNS line — the account side
    lines.push(
      [
        "TRNS",
        String(idx + 1),   // TRNSID
        TRNS_TYPE,
        date,
        ACCOUNT,
        "",                 // NAME (payee — not available in bank statement data)
        trnsAmount.toFixed(2),
        memo,
      ].join("\t")
    );

    // SPL line — the offsetting side
    lines.push(
      [
        "SPL",
        String(idx + 1),   // SPLID
        TRNS_TYPE,
        date,
        SPLIT_ACCOUNT,
        "",
        splAmount.toFixed(2),
        memo,
      ].join("\t")
    );

    lines.push("ENDTRNS");
  });

  return lines.join("\r\n");
}
