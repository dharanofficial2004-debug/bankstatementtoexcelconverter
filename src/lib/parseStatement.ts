import { Transaction } from "./types";
import { PDFExcavator, detectBorderlessTables } from "pdfexcavator";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

// Override the PDF.js worker source immediately using a direct physical file scheme
try {
  console.log("--- WORKER SETUP: Overriding PDF.js worker path to physical node_modules path ---");
  const physicalPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
  const fileUrl = pathToFileURL(physicalPath).href;
  pdfjsLib.GlobalWorkerOptions.workerSrc = fileUrl;
  console.log("--- WORKER SETUP: Successfully overrode workerSrc to physical file URL:", fileUrl);
} catch (err) {
  console.error("--- WORKER SETUP ERROR: Failed to resolve/set workerSrc:", err);
}

interface ParseResult {
  success: boolean;
  bank_detected: string;
  transactions: Transaction[];
  total: number;
  pages: number;
  headers?: string[];
  error?: string;
}

interface ColumnMapping {
  dateIndex: number;
  descriptionIndex: number;
  refIndex: number;
  debitIndex: number;
  creditIndex: number;
  balanceIndex: number;
  headerRowIndex: number;
  headerLabels: string[];
}

// Bank detection patterns
const BANK_PATTERNS: Record<string, RegExp[]> = {
  HDFC: [/narration/i, /chq.*ref/i, /hdfc\s*bank/i, /value\s*dt/i],
  SBI: [/txn\s*date/i, /value\s*date/i, /state\s*bank/i, /sbi/i],
  ICICI: [/transaction\s*remarks/i, /icici\s*bank/i, /txn\s*date/i],
  AXIS: [/particulars/i, /axis\s*bank/i, /tran\s*date/i],
  KOTAK: [/kotak/i, /mahindra/i, /narration/i],
  CHASE: [/chase/i, /posting\s*date/i, /details/i],
  BARCLAYS: [/barclays/i, /payment\s*type/i],
  HSBC: [/hsbc/i, /transaction\s*date/i],
  BOA: [/bank\s*of\s*america/i, /posted\s*date/i],
  WELLS_FARGO: [/wells\s*fargo/i, /posting\s*date/i],
};

// Amount cleaning: handles various formats
function cleanAmount(raw: string): string {
  if (!raw || raw.trim() === "" || raw.trim() === "-") return "";
  
  let cleaned = raw.trim();
  
  // Remove currency symbols
  cleaned = cleaned.replace(/[₹$€£¥]/g, "").trim();
  
  // Handle parentheses for negative: (1,234.56) → -1234.56
  const isNegative = /^\(.*\)$/.test(cleaned);
  if (isNegative) {
    cleaned = cleaned.replace(/[()]/g, "");
  }
  
  // Detect European format: 1.234,56
  if (/^\d{1,3}(\.\d{3})*(,\d{2})?$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // Standard format: remove commas
    cleaned = cleaned.replace(/,/g, "");
  }
  
  const num = parseFloat(cleaned);
  if (isNaN(num)) return "";
  
  const result = isNegative ? -num : num;
  return result.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Date validation: matches dd/mm/yyyy, dd-mm-yyyy, dd Jan yyyy, etc. with valid month names
const DATE_REGEX = /\b\d{1,2}[\/\-\.\s]+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2})(?:[\/\-\.\s]+\d{2,4})?\b/i;

function isValidDate(str: string): boolean {
  if (!str) return false;
  const val = str.trim();
  if (val.length < 5 || val.length > 15) return false;
  return DATE_REGEX.test(val);
}

const BANK_NAMES: Record<string, RegExp> = {
  HDFC: /hdfc/i,
  SBI: /state\s*bank|sbi/i,
  ICICI: /icici/i,
  AXIS: /axis\s*bank/i,
  KOTAK: /kotak|mahindra/i,
  CHASE: /chase/i,
  BARCLAYS: /barclays/i,
  HSBC: /hsbc/i,
  BOA: /bank\s*of\s*america/i,
  WELLS_FARGO: /wells\s*fargo/i,
};

function detectBank(text: string): string {
  const upperText = text.toUpperCase();
  
  // First match bank names explicitly
  for (const [bank, regex] of Object.entries(BANK_NAMES)) {
    if (regex.test(upperText)) return bank;
  }
  
  for (const [bank, patterns] of Object.entries(BANK_PATTERNS)) {
    const matches = patterns.filter((p) => p.test(upperText));
    if (matches.length >= 2) return bank;
  }
  
  // Single pattern fallback
  for (const [bank, patterns] of Object.entries(BANK_PATTERNS)) {
    if (patterns.some((p) => p.test(upperText))) return bank;
  }
  
  return "GENERIC";
}

function isSkipRow(row: (string | null)[]): boolean {
  if (!row || row.every(cell => !cell || cell.trim() === "")) return true;
  
  const joined = row.filter(Boolean).join(" ").toLowerCase();
  return (
    joined.includes("opening balance") ||
    joined.includes("closing balance") ||
    joined.includes("total carried") ||
    joined.includes("total brought") ||
    joined.includes("page ") ||
    joined.includes("statement of account") ||
    joined.includes("account summary") ||
    joined.includes("customer id") ||
    joined.includes("nomination") ||
    joined.includes("carried forward") ||
    joined.includes("brought forward") ||
    joined.includes("statement generated") ||
    joined.includes("generated on") ||
    joined.includes("end of statement") ||
    joined.includes("important information") ||
    joined.includes("commonly used narrations") ||
    joined.includes("any discrepancy") ||
    joined.includes("this is a system generated") ||
    joined.includes("balance forward") ||
    joined.includes("forward balance") ||
    joined.includes("reward points") ||
    joined.includes("reward plus")
  );
}

/**
 * Searches the first few rows of a table to identify the header row and map the column indexes.
 */
function findHeaderRow(rows: (string | null)[][]): ColumnMapping | null {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r].map(cell => (cell || "").toLowerCase().trim());
    
    let dateIdx = -1;
    let descIdx = -1;
    let refIdx = -1;
    let debitIdx = -1;
    let creditIdx = -1;
    let balanceIdx = -1;
    let amountIdx = -1;
    let typeIdx = -1;
    
    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (!val) continue;
      
      // Match Date
      if (["date", "txn date", "value date", "tran date", "post date", "booking date", "txndate"].some(k => val.includes(k))) {
        if (dateIdx === -1) dateIdx = c;
      }
      // Match Description
      else if (["description", "particulars", "narration", "remarks", "details", "transaction details", "transaction remarks"].some(k => val.includes(k))) {
        if (descIdx === -1) descIdx = c;
      }
      // Match Ref
      else if (["chq", "ref", "instrument", "chq/ref", "ref. no", "reference", "cheque", "chq. no", "doc no", "chq/ref no"].some(k => val.includes(k))) {
        if (refIdx === -1) refIdx = c;
      }
      // Match Debit / Withdrawal
      else if (["withdrawal", "debit", "dr", "withdraw", "payment", "amount (dr)", "money out", "paid out", "charges"].some(k => val.includes(k))) {
        if (debitIdx === -1) debitIdx = c;
      }
      // Match Credit / Deposit
      else if (["deposit", "credit", "cr", "dep", "receipt", "amount (cr)", "money in", "paid in", "deposit (cr)"].some(k => val.includes(k))) {
        if (creditIdx === -1) creditIdx = c;
      }
      // Match Balance
      else if (["balance", "bal", "running balance", "closing balance", "runningbal"].some(k => val.includes(k))) {
        if (balanceIdx === -1) balanceIdx = c;
      }
      // Match Amount (Single column)
      else if (["amount", "txn amount", "value", "sum"].some(k => val.includes(k))) {
        if (amountIdx === -1) amountIdx = c;
      }
      // Match Type
      else if (["type", "dr/cr", "d/c", "sign"].some(k => val.includes(k))) {
        if (typeIdx === -1) typeIdx = c;
      }
    }
    
    // A valid header row should have at least Date and Description, plus Balance or Debit/Credit/Amount
    const score = (dateIdx !== -1 ? 1 : 0) + (descIdx !== -1 ? 1 : 0) + (balanceIdx !== -1 ? 1 : 0) + 
                  (debitIdx !== -1 || creditIdx !== -1 || amountIdx !== -1 ? 1 : 0);
                  
    if (score >= 3) {
      const mapping = {
        dateIndex: dateIdx,
        descriptionIndex: descIdx,
        refIndex: refIdx,
        debitIndex: debitIdx !== -1 ? debitIdx : (amountIdx !== -1 && typeIdx === -1 ? amountIdx : -1),
        creditIndex: creditIdx !== -1 ? creditIdx : -1,
        balanceIndex: balanceIdx,
        headerRowIndex: r,
        headerLabels: rows[r].map((h, idx) => {
          const val = (h || "").trim();
          if (val) return val;
          if (idx === dateIdx) return "Date";
          if (idx === descIdx) return "Description";
          if (idx === refIdx) return "Chq/Ref. No.";
          if (idx === debitIdx) return "Withdrawal (Dr.)";
          if (idx === creditIdx) return "Deposit (Cr.)";
          if (idx === balanceIdx) return "Balance";
          return `Column ${idx + 1}`;
        }),
      };
      console.log("--- PARSER: Found table header mapping:", mapping);
      return mapping;
    }
  }
  return null;
}

function isNumericAmount(token: string): boolean {
  if (!token) return false;
  const cleaned = token.replace(/[₹$€£\s,]/g, "");
  // Matches numbers like 2.00, 1000, -50.23, etc.
  if (!/^\-?\d+(\.\d{1,2})?$/.test(cleaned)) return false;
  // If it's a huge integer (e.g. length >= 8 and no decimal point), it's probably a reference/ID number
  if (/^\d{8,}$/.test(cleaned)) return false;
  return true;
}

function hasAmounts(line: string, requireBalance: boolean = true): boolean {
  if (!line) return false;
  const tokens = line.split(/\s+/).filter(Boolean);
  if (tokens.length < 1) return false;
  
  const lastToken = tokens[tokens.length - 1];
  
  // If the last token is a numeric amount, and there's another numeric amount in the last 3 tokens:
  if (isNumericAmount(lastToken)) {
    if (requireBalance) {
      for (let i = Math.max(0, tokens.length - 3); i < tokens.length - 1; i++) {
        if (isNumericAmount(tokens[i])) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }
  return false;
}

function detectHeaderLabels(lines: string[]): string[] {
  let dateLabel = "Date";
  let descLabel = "Description";
  let refLabel = "Chq/Ref. No.";
  let debitLabel = "Withdrawal (Dr.)";
  let creditLabel = "Deposit (Cr.)";
  let balanceLabel = "Balance";
  
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    // Check if this line is a header row
    const tokens = lineLower.split(/\s+/).filter(Boolean);
    let matches = 0;
    
    const hasDesc = tokens.some(t => t.includes("description") || t.includes("particulars") || t.includes("narration") || t.includes("remarks"));
    const hasRef = tokens.some(t => t.includes("cheque") || t.includes("chq") || t.includes("ref") || t.includes("instrument"));
    const hasDebit = tokens.some(t => t.includes("withdrawal") || t.includes("debit") || t.includes("dr") || t.includes("payment"));
    const hasCredit = tokens.some(t => t.includes("deposit") || t.includes("credit") || t.includes("cr") || t.includes("receipt"));
    const hasBalance = tokens.some(t => t.includes("balance") || t.includes("bal"));
    
    if (hasDesc) matches++;
    if (hasRef) matches++;
    if (hasDebit) matches++;
    if (hasCredit) matches++;
    if (hasBalance) matches++;
    
    if (matches >= 3) {
      console.log("--- FALLBACK PARSER: Found header row line:", line);
      
      let candidateLines: string[] = [];
      if (i > 1) candidateLines.push(lines[i - 2]);
      if (i > 0) candidateLines.push(lines[i - 1]);
      candidateLines.push(line);
      
      for (const rawLine of candidateLines) {
        const rawTokens = rawLine.split(/\s{2,}/).map(t => t.trim()).filter(Boolean);
        const allWords = rawLine.split(/\s+/).map(t => t.trim()).filter(Boolean);
        
        for (const token of [...rawTokens, ...allWords]) {
          const tLower = token.toLowerCase();
          
          if (tLower === "date" || tLower === "value date" || tLower === "txn date" || tLower === "tran date" || tLower === "value") {
            dateLabel = token;
          }
          if (tLower.includes("description") || tLower.includes("particulars") || tLower.includes("narration") || tLower.includes("remarks")) {
            descLabel = token;
          }
          if (tLower.includes("cheque") || tLower.includes("chq") || tLower.includes("ref") || tLower.includes("instrument")) {
            refLabel = token;
          }
          if (tLower.includes("withdrawal") || tLower.includes("debit") || tLower.includes("dr") || tLower.includes("payment")) {
            debitLabel = token;
          }
          if (tLower.includes("deposit") || tLower.includes("credit") || tLower.includes("cr") || tLower.includes("receipt")) {
            creditLabel = token;
          }
          if (tLower.includes("balance") || tLower.includes("bal")) {
            balanceLabel = token;
          }
        }
      }
      break;
    }
  }
  
  const result = [dateLabel, descLabel, refLabel, debitLabel, creditLabel, balanceLabel];
  console.log("--- FALLBACK PARSER: Detected dynamic headers:", result);
  return result;
}

function extractChqRef(text: string): { cleanText: string, chqRef: string } {
  const tokens = text.split(/\s+/).filter(Boolean);
  let chqRef = "";
  const remainingTokens: string[] = [];
  
  for (const token of tokens) {
    // Check if token matches standard cheque/ref patterns
    const isRef = /^(UPI|NEFT|IMPS|RTGS|FT|CHQ|Ref|TXN|Pay)[\-\:]?\d+/i.test(token) || 
                  /^\d{6,15}$/.test(token) ||
                  /^[A-Z]{3,4}\d{6,12}$/i.test(token);
                  
    if (isRef && !chqRef) {
      chqRef = token;
    } else {
      remainingTokens.push(token);
    }
  }
  
  return {
    cleanText: remainingTokens.join(" "),
    chqRef
  };
}

function parseTextFallback(rawText: string, bank: string, pageCount: number): ParseResult {
  try {
    fs.writeFileSync(path.join(process.cwd(), "fallback_text.txt"), rawText, "utf-8");
    console.log("--- FALLBACK PARSER: Successfully wrote diagnostic file fallback_text.txt ---");
  } catch (err) {
    console.error("--- FALLBACK PARSER ERROR: Failed to write diagnostic file fallback_text.txt:", err);
  }
  
  console.log("--- FALLBACK PARSER: Processing text with length:", rawText.length);
  
  // Find opening balance in the text (support Balance Forward as well)
  let openingBalance = NaN;
  const opBalMatch = rawText.match(/(?:Opening\s+Bal(?:ance)?|Op\s+Bal|Balance\s+Forward|Bal\s+Forward)[^\d]*(\-?\d[\d\,\.]*)/i);
  if (opBalMatch) {
    openingBalance = parseFloat(opBalMatch[1].replace(/,/g, ""));
    console.log("--- FALLBACK PARSER: Extracted opening balance:", openingBalance);
  }

  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const transactions: Transaction[] = [];
  let txId = 1;
  
  // Prepend Opening Balance row if found
  if (!isNaN(openingBalance)) {
    transactions.push({
      id: String(txId++),
      date: "-",
      description: "Opening Balance",
      chqRefNo: "-",
      debit: "",
      credit: "",
      balance: cleanAmount(String(openingBalance))
    });
    console.log(`[Fallback] Prepended Opening Balance: ${openingBalance}`);
  }
  
  // Detect dynamic headers from text
  const detectedHeaders = detectHeaderLabels(lines);
  const hasBalanceHeader = detectedHeaders[5].toLowerCase().includes("balance") || detectedHeaders[5].toLowerCase().includes("bal");
  console.log(`--- FALLBACK PARSER: hasBalanceHeader = ${hasBalanceHeader}`);
  
  // Regex to detect start of transaction
  const requireSeq = bank === "KOTAK";
  const MONTH_PAT = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|0?[1-9]|1[0-2])";
  const DATE_PAT = `\\b\\d{1,2}[\\/\\-\\.\\s]+${MONTH_PAT}(?:[\\/\\-\\.\\s]+\\d{2,4})?\\b`;
  const TX_START_REGEX = requireSeq
    ? new RegExp(`^(?:(\\d+)\\s+)(${DATE_PAT})\\s*(.*)$`, "i")
    : new RegExp(`^(?:(\\d+)\\s+)?(${DATE_PAT})\\s*(.*)$`, "i");
  
  interface RawTxBlock {
    index?: string;
    date: string;
    descriptionStart: string;
    subsequentLines: string[];
  }
  
  const blocks: RawTxBlock[] = [];
  let currentBlock: RawTxBlock | null = null;
  let currentBlockClosed = false;
  
  for (const line of lines) {
    if (isSkipRow([line])) {
      continue;
    }
    
    // Skip date ranges / header lines containing " - " or " to "
    if (line.includes(" - ") || /\bto\b/i.test(line)) {
      continue;
    }
    
    const match = line.match(TX_START_REGEX);
    if (match) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        index: match[1],
        date: match[2],
        descriptionStart: match[3] || "",
        subsequentLines: []
      };
      // Check if start line itself contains the transaction amounts
      currentBlockClosed = hasAmounts(line, hasBalanceHeader);
    } else {
      if (currentBlock && !currentBlockClosed) {
        currentBlock.subsequentLines.push(line);
        if (hasAmounts(line, hasBalanceHeader)) {
          currentBlockClosed = true;
        }
      }
    }
  }
  
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  
  console.log("--- FALLBACK PARSER: Formed transaction blocks count:", blocks.length);
  
  let lastBalance = openingBalance;
  
  for (const block of blocks) {
    // Reconstruct description and identify amounts
    let amount = "";
    let balance = "";
    
    // We look at subsequentLines to find ChqRefNo, Amount, Balance
    const allLines = [block.descriptionStart, ...block.subsequentLines].map(l => l.trim()).filter(Boolean);
    if (allLines.length === 0) continue;
    
    const lastLine = allLines[allLines.length - 1];
    const tokens = lastLine.split(/\s+/).filter(Boolean);
    
    // Scan right-to-left for numeric amounts
    let foundAmounts: string[] = [];
    let remainingTokensOnLastLine: string[] = [];
    
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (isNumericAmount(token) && foundAmounts.length < 2) {
        foundAmounts.unshift(token);
      } else {
        remainingTokensOnLastLine.unshift(token);
      }
    }
    
    if (foundAmounts.length >= 1) {
      if (foundAmounts.length === 2 && hasBalanceHeader) {
        amount = foundAmounts[0];
        balance = foundAmounts[1];
      } else {
        amount = foundAmounts[0];
      }
      
      // Update the last line of allLines with the remaining tokens
      allLines[allLines.length - 1] = remainingTokensOnLastLine.join(" ");
    }
    
    // Concatenate all description text
    const fullDescText = allLines.filter(Boolean).join(" ");
    
    // Extract Chq/Ref No from fullDescText
    const { cleanText: finalDescription, chqRef } = extractChqRef(fullDescText);
    
    // Determine Debit / Credit based on balance change
    let debit = "";
    let credit = "";
    
    const balVal = balance ? parseFloat(balance.replace(/,/g, "")) : NaN;
    const amtVal = amount ? parseFloat(amount.replace(/,/g, "")) : NaN;
    
    if (!isNaN(balVal) && !isNaN(amtVal)) {
      if (!isNaN(lastBalance)) {
        const diff = balVal - lastBalance;
        if (diff > 0.005) {
          credit = cleanAmount(amount);
        } else if (diff < -0.005) {
          debit = cleanAmount(amount);
        } else {
          // If diff is 0, infer from keywords
          const isCreditKeyword = /deposit|interest|credit|refund|salary/i.test(finalDescription);
          if (isCreditKeyword) {
            credit = cleanAmount(amount);
          } else {
            debit = cleanAmount(amount);
          }
        }
      } else {
        // First transaction, no lastBalance
        const isCreditKeyword = /deposit|interest|credit|refund|salary/i.test(finalDescription);
        if (isCreditKeyword) {
          credit = cleanAmount(amount);
        } else {
          debit = cleanAmount(amount);
        }
      }
      lastBalance = balVal;
    } else if (!isNaN(amtVal)) {
      // No balance token, infer from keywords
      const isCreditKeyword = /deposit|interest|credit|refund|salary/i.test(finalDescription);
      if (isCreditKeyword) {
        credit = cleanAmount(amount);
      } else {
        debit = cleanAmount(amount);
      }
    }
    
    transactions.push({
      id: String(txId++),
      date: block.date,
      description: finalDescription || `Transaction ${txId - 1}`,
      chqRefNo: chqRef || "-",
      debit,
      credit,
      balance: balance ? cleanAmount(balance) : ""
    });
    
    console.log(`[Fallback] Added Transaction: Date=${block.date}, Desc="${finalDescription}", ChqRef=${chqRef}, Debit=${debit}, Credit=${credit}, Balance=${balance}`);
  }
  
  if (transactions.length === 0) {
    return {
      success: false,
      bank_detected: bank,
      transactions: [],
      total: 0,
      pages: pageCount,
      error: "No transactions could be parsed from the layout text."
    };
  }
  
  // Populate dynamic column properties for all transactions in fallback
  transactions.forEach((tx) => {
    tx.col0 = tx.date;
    tx.col1 = tx.description;
    tx.col2 = tx.chqRefNo;
    tx.col3 = tx.debit;
    tx.col4 = tx.credit;
    tx.col5 = tx.balance;
  });

  return {
    success: true,
    bank_detected: bank,
    transactions,
    total: transactions.length,
    pages: pageCount,
    headers: detectedHeaders
  };
}

export async function parseStatement(buffer: Buffer): Promise<ParseResult> {
  console.log("--- PARSER START: Processing statement buffer ---");
  try {
    console.log("--- PARSER: Loading PDF using PDFExcavator.fromBuffer ---");
    const pdf = await PDFExcavator.fromBuffer(buffer);
    const pageCount = pdf.pageCount;
    console.log("--- PARSER: PDF loaded successfully. Page count:", pageCount);
    
    if (pageCount === 0) {
      console.warn("--- PARSER WARNING: PDF has 0 pages ---");
      return {
        success: false,
        bank_detected: "UNKNOWN",
        transactions: [],
        total: 0,
        pages: 0,
        error: "PDF has no pages.",
      };
    }

    // Detect Bank using first page text
    console.log("--- PARSER: Extracting text from Page 1 to detect bank ---");
    const firstPage = pdf.getPage(0);
    const firstPageText = await firstPage.extractText();
    const bank = detectBank(firstPageText);
    console.log("--- PARSER: Bank detected:", bank);

    const transactions: Transaction[] = [];
    let txId = 1;
    let lastDate = "";
    let mapping: ColumnMapping | null = null;

    for (const page of pdf.pages) {
      const pageNum = page.pageNumber;
      console.log(`--- PARSER: Processing Page ${pageNum + 1}/${pageCount} ---`);
      
      // 1. Try to extract bordered tables
      console.log(`[Page ${pageNum + 1}] Extracting bordered tables...`);
      let tables = await page.extractTables();
      
      // 2. Fallback to borderless tables using projection profile
      if (!tables || tables.length === 0) {
        console.log(`[Page ${pageNum + 1}] No bordered tables found. Running borderless table extraction...`);
        const chars = await page.chars;
        tables = detectBorderlessTables(chars, page.pageNumber, {
          minWordsVertical: 3,
          minWordsHorizontal: 1
        });
      }
      
      console.log(`[Page ${pageNum + 1}] Extracted tables count:`, tables?.length || 0);
      
      for (let t = 0; t < tables.length; t++) {
        const table = tables[t];
        const rows = table.rows;
        if (!rows || rows.length === 0) {
          console.log(`[Page ${pageNum + 1}] Table ${t + 1} has 0 rows, skipping.`);
          continue;
        }
        
        console.log(`[Page ${pageNum + 1}] Table ${t + 1} rows count:`, rows.length);
        
        // Find header row and map column layout
        if (!mapping) {
          console.log(`[Page ${pageNum + 1}] Scanning for table header row...`);
          mapping = findHeaderRow(rows);
        }
        
        const activeMapping = mapping || {
          dateIndex: 0,
          descriptionIndex: 1,
          refIndex: -1,
          debitIndex: 2,
          creditIndex: 3,
          balanceIndex: 4,
          headerRowIndex: -1,
          headerLabels: ["Date", "Description", "Ref No.", "Withdrawal", "Deposit", "Balance"]
        };
        
        // Skip headers on the page containing the header row
        const startIndex = (mapping && mapping.headerRowIndex !== -1 && page.pageNumber === 0) 
          ? mapping.headerRowIndex + 1 
          : 0;
          
        console.log(`[Page ${pageNum + 1}] Processing rows starting at index:`, startIndex);
        
        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          
          if (isSkipRow(row)) {
            // Log skip for transparency
            console.log(`[Page ${pageNum + 1}] Skip row:`, row.filter(Boolean).join(" | "));
            continue;
          }
          
          // Skip exact header repetitions across page splits
          const rowJoined = row.filter(Boolean).join(" ").toLowerCase();
          if (rowJoined.includes("date") && (rowJoined.includes("description") || rowJoined.includes("particulars"))) {
            console.log(`[Page ${pageNum + 1}] Skipping repeat header row:`, rowJoined);
            continue;
          }
          
          const rawDate = activeMapping.dateIndex !== -1 ? (row[activeMapping.dateIndex] || "").trim() : "";
          const rawDesc = activeMapping.descriptionIndex !== -1 ? (row[activeMapping.descriptionIndex] || "").trim() : "";
          const rawRef = activeMapping.refIndex !== -1 ? (row[activeMapping.refIndex] || "").trim() : "";
          
          let debit = "";
          let credit = "";
          let balance = "";
          
          // Handle Debit and Credit extraction
          if (activeMapping.debitIndex !== -1) {
            const rawDebit = row[activeMapping.debitIndex] || "";
            
            // Single Amount column handling
            if (activeMapping.creditIndex === -1) {
              const num = parseFloat(rawDebit.replace(/[₹$€£\s,]/g, ""));
              if (!isNaN(num)) {
                const rowStr = row.join(" ").toUpperCase();
                const isCredit = rowStr.includes("CR") || rowStr.includes("DEP") || rowStr.includes("IN") || num > 0;
                if (isCredit) {
                  credit = cleanAmount(rawDebit);
                } else {
                  debit = cleanAmount(rawDebit);
                }
              }
            } else {
              debit = cleanAmount(rawDebit);
            }
          }
          
          if (activeMapping.creditIndex !== -1) {
            credit = cleanAmount(row[activeMapping.creditIndex] || "");
          }
          
          if (activeMapping.balanceIndex !== -1) {
            balance = cleanAmount(row[activeMapping.balanceIndex] || "");
          }
          
          const hasDate = isValidDate(rawDate);
          if (hasDate) {
            lastDate = rawDate;
          }
          
          const hasAmounts = debit !== "" || credit !== "" || balance !== "";
          
          if (hasDate || hasAmounts) {
            // Check if this row is a description continuation
            if (!hasDate && !hasAmounts && transactions.length > 0) {
              const lastTx = transactions[transactions.length - 1];
              lastTx.description += " " + rawDesc;
              if (activeMapping.descriptionIndex !== -1) {
                lastTx[`col${activeMapping.descriptionIndex}`] = (lastTx[`col${activeMapping.descriptionIndex}`] || "") + " " + rawDesc;
              }
              console.log(`[Page ${pageNum + 1}] Description continuation: Appended "${rawDesc}" to tx ID ${lastTx.id}`);
            } else {
              const newTx: Transaction = {
                id: String(txId++),
                date: hasDate ? rawDate : lastDate,
                description: rawDesc || `Transaction ${txId - 1}`,
                chqRefNo: rawRef,
                debit,
                credit,
                balance,
              };
              
              row.forEach((cell, idx) => {
                newTx[`col${idx}`] = (cell || "").trim();
              });
              
              transactions.push(newTx);
              console.log(`[Page ${pageNum + 1}] Added Transaction: Date=${newTx.date}, Desc="${newTx.description}", Debit=${newTx.debit}, Credit=${newTx.credit}, Balance=${newTx.balance}`);
            }
          } else if (rawDesc && transactions.length > 0) {
            // Continuation of description
            const lastTx = transactions[transactions.length - 1];
            lastTx.description += " " + rawDesc;
            if (activeMapping.descriptionIndex !== -1) {
              lastTx[`col${activeMapping.descriptionIndex}`] = (lastTx[`col${activeMapping.descriptionIndex}`] || "") + " " + rawDesc;
            }
            console.log(`[Page ${pageNum + 1}] Description continuation: Appended "${rawDesc}" to tx ID ${lastTx.id}`);
          }
        }
      }
    }
    
    console.log("--- PARSER: Finished processing. Total raw transactions parsed:", transactions.length);

    // Fallback: If no transactions were extracted via table tools, run a layout-preserved text extraction fallback
    if (transactions.length === 0) {
      console.warn("--- PARSER WARNING: Extracted 0 transactions via table tools. Attempting text fallback... ---");
      
      let allText = "";
      let t1Accum = "";
      let t2Accum = "";
      let t3Accum = "";
      
      for (const page of pdf.pages) {
        console.log(`[Fallback] Running extraction tests on Page ${page.pageNumber + 1}:`);
        const t1 = await page.extractText();
        const t2 = await page.extractTextWithLayout();
        const t3 = await page.extractTextRaw();
        
        console.log(`  - extractText length: ${t1?.length || 0}`);
        console.log(`  - extractTextWithLayout length: ${t2?.length || 0}`);
        console.log(`  - extractTextRaw length: ${t3?.length || 0}`);
        
        t1Accum += (t1 || "") + "\n--- PAGE BREAK ---\n";
        t2Accum += (t2 || "") + "\n--- PAGE BREAK ---\n";
        t3Accum += (t3 || "") + "\n--- PAGE BREAK ---\n";
        
        // Fallback hierarchy: prefer layout, then standard, then raw stream order
        const pageText = t2 || t1 || t3 || "";
        allText += pageText + "\n";
      }
      
      try {
        fs.writeFileSync(path.join(process.cwd(), "fallback_t1.txt"), t1Accum, "utf-8");
        fs.writeFileSync(path.join(process.cwd(), "fallback_t2.txt"), t2Accum, "utf-8");
        fs.writeFileSync(path.join(process.cwd(), "fallback_t3.txt"), t3Accum, "utf-8");
        console.log("--- FALLBACK DIAGNOSTICS: Wrote fallback_t1.txt, fallback_t2.txt, fallback_t3.txt ---");
      } catch (e) {
        console.error("--- FALLBACK DIAGNOSTICS ERROR: Failed to write files:", e);
      }
      
      await pdf.close();
      
      let result = parseTextFallback(t3Accum, bank, pageCount);
      if (!result.success || result.transactions.length === 0) {
        console.log("--- PARSER: Falling back to standard text extraction (t1) ---");
        result = parseTextFallback(t1Accum, bank, pageCount);
      }
      if (!result.success || result.transactions.length === 0) {
        console.log("--- PARSER: Falling back to layout text extraction (t2) ---");
        result = parseTextFallback(t2Accum, bank, pageCount);
      }
      return result;
    }

    // Clean up headers labels for returning to UI
    let finalHeaders: string[] = ["Date", "Description", "Chq/Ref. No.", "Withdrawal (Dr.)", "Deposit (Cr.)", "Balance"];
    if (mapping && mapping.headerLabels && mapping.headerLabels.length >= 3) {
      finalHeaders = mapping.headerLabels;
    }
    console.log("--- PARSER SUCCESS: Sending response with headers:", finalHeaders);
    await pdf.close();

    return {
      success: true,
      bank_detected: bank,
      transactions,
      total: transactions.length,
      pages: pageCount,
      headers: finalHeaders
    };

  } catch (err) {
    console.error("--- PARSER ERROR: Unexpected error during parsing:", err);
    return {
      success: false,
      bank_detected: "UNKNOWN",
      transactions: [],
      total: 0,
      pages: 0,
      error: `Failed to parse statement: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
