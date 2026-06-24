import { Transaction } from "./types";
import { PDFExcavator } from "pdfexcavator";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

// Override the PDF.js worker source immediately using a direct physical file scheme, falling back to CDN on serverless environments like Vercel
try {
  console.log("--- WORKER SETUP: Overriding PDF.js worker path ---");
  const physicalPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
  if (fs.existsSync(physicalPath)) {
    const fileUrl = pathToFileURL(physicalPath).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = fileUrl;
    console.log("--- WORKER SETUP: Successfully overrode workerSrc to local physical file URL:", fileUrl);
  } else {
    // Fallback for Vercel Serverless environment where node_modules is not physically at process.cwd()
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs";
    console.log("--- WORKER SETUP: Local worker not found. Using CDN fallback:", pdfjsLib.GlobalWorkerOptions.workerSrc);
  }
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

// Removed unused findHeaderRow function

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
      
      const candidateLines: string[] = [];
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
    const foundAmounts: string[] = [];
    const remainingTokensOnLastLine: string[] = [];
    
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

    // Detect Bank (optional metadata check)
    const firstPage = pdf.getPage(0);
    const firstPageText = await firstPage.extractText();
    const bank = detectBank(firstPageText);
    console.log("--- PARSER: Bank detected:", bank);

    const transactions: Transaction[] = [];
    let txId = 1;
    let finalHeaders: string[] = [];
    let colBoundaries: { label: string; x: number; x1: number }[] = [];

    // Dynamic column index maps
    let dateIdx = -1;
    let descIdx = -1;
    let amountIndices: number[] = [];

    for (const page of pdf.pages) {
      const pageNum = page.pageNumber;
      console.log(`--- PARSER: Processing Page ${pageNum + 1}/${pageCount} ---`);
      
      const content = await page.pdfPage.getTextContent();
      const items = content.items;
      
      // 1. Group items by y-coordinate (tolerance of 8pt to group offset headers like Value Date)
      const rawRows: { y: number; items: { text: string; x: number; width: number; x1: number }[] }[] = [];
      (items as { str?: string; transform?: number[]; width?: number }[]).forEach((item) => {
        if (item.str === undefined || !item.transform || item.width === undefined) return;
        const x = item.transform[4];
        const y = item.transform[5];
        
        let added = false;
        for (const r of rawRows) {
          if (Math.abs(r.y - y) < 8) {
            r.items.push({ text: item.str, x, width: item.width, x1: x + item.width });
            added = true;
            break;
          }
        }
        if (!added) {
          rawRows.push({ y, items: [{ text: item.str, x, width: item.width, x1: x + item.width }] });
        }
      });
      
      // Sort rows from top to bottom (y coordinate descending)
      rawRows.sort((a, b) => b.y - a.y);
      
      // 2. For each row, sort items left-to-right and merge close items (narrow tolerance of 5pt to keep narrow columns separated)
      const mergedRows: { y: number; items: { text: string; x: number; width: number; x1: number }[] }[] = [];
      rawRows.forEach(r => {
        r.items.sort((a, b) => a.x - b.x);
        
        const mergedItems: { text: string; x: number; width: number; x1: number }[] = [];
        let currentItem: { text: string; x: number; width: number; x1: number } | null = null;
        
        r.items.forEach(item => {
          if (!currentItem) {
            currentItem = { ...item };
          } else {
            const gap = item.x - currentItem.x1;
            const isSpaceWithLargeWidth = (item.text.trim() === "" && item.width > 15) || (currentItem.text.trim() === "" && currentItem.width > 15);
            
            if (gap < 5 && !isSpaceWithLargeWidth) {
              currentItem.text += item.text;
              currentItem.x1 = Math.max(currentItem.x1, item.x1);
              currentItem.width = currentItem.x1 - currentItem.x;
            } else {
              mergedItems.push(currentItem);
              currentItem = { ...item };
            }
          }
        });
        if (currentItem) {
          mergedItems.push(currentItem);
        }
        
        const cleanedItems = mergedItems.map(item => ({
          ...item,
          text: item.text.replace(/\s+/g, " ").trim()
        })).filter(item => item.text !== "");
        
        if (cleanedItems.length > 0) {
          mergedRows.push({ y: r.y, items: cleanedItems });
        }
      });

      // 3. Find/Select Header Row if not already determined
      let headerRow: typeof mergedRows[0] | null = null;
      let headerRowIdx = -1;
      
      if (finalHeaders.length === 0) {
        for (let i = 0; i < mergedRows.length; i++) {
          const r = mergedRows[i];
          if (r.items.length >= 3) {
            const joined = r.items.map(item => item.text.toLowerCase()).join(" ");
            if (
              joined.includes("item") || 
              joined.includes("description") || 
              joined.includes("particulars") || 
              joined.includes("date") || 
              joined.includes("amount") ||
              joined.includes("narration") ||
              joined.includes("balance") ||
              joined.includes("withdrawal") ||
              joined.includes("deposit")
            ) {
              headerRow = r;
              headerRowIdx = i;
              break;
            }
          }
        }
        
        // Fallback: use first row with >= 3 items
        if (!headerRow) {
          for (let i = 0; i < mergedRows.length; i++) {
            if (mergedRows[i].items.length >= 3) {
              headerRow = mergedRows[i];
              headerRowIdx = i;
              break;
            }
          }
        }
        
        if (headerRow) {
          finalHeaders = headerRow.items.map((item, idx: number) => item.text || `Column ${idx + 1}`);
          colBoundaries = headerRow.items.map((item) => ({
            label: item.text,
            x: item.x,
            x1: item.x1
          }));
          console.log("--- PARSER: Dynamic headers extracted:", finalHeaders);

          // Identify key indices dynamically based on header labels
          descIdx = colBoundaries.findIndex(col => {
            const lbl = col.label.toLowerCase();
            return lbl.includes("description") || lbl.includes("particulars") || lbl.includes("narration") || lbl.includes("remarks");
          });
          dateIdx = colBoundaries.findIndex(col => {
            const lbl = col.label.toLowerCase();
            return lbl.includes("date") && !lbl.includes("value");
          });
          amountIndices = colBoundaries.map((col, idx) => {
            const lbl = col.label.toLowerCase();
            if (
              lbl.includes("withdrawal") || 
              lbl.includes("debit") || 
              lbl.includes("deposit") || 
              lbl.includes("credit") || 
              lbl.includes("balance") || 
              lbl.includes("amount") ||
              lbl.includes("payment") ||
              lbl.includes("charges") ||
              lbl.includes("receipt")
            ) {
              return idx;
            }
            return -1;
          }).filter(idx => idx !== -1);
        }
      }
      
      // If we still don't have header boundaries, we can't extract the table rows yet, skip this page
      if (colBoundaries.length === 0) {
        continue;
      }
      
      const startIndex = headerRow ? headerRowIdx + 1 : 0;
      
      for (let i = startIndex; i < mergedRows.length; i++) {
        const r = mergedRows[i];
        
        // Stop parsing if we hit totals or notes boundaries
        const rowText = r.items.map(item => item.text.toLowerCase()).join(" ");
        if (
          rowText.includes("subtotal") || 
          rowText.includes("notes") || 
          rowText.includes("terms") || 
          rowText.includes("amount paid") ||
          rowText.includes("carried forward") ||
          rowText.includes("brought forward") ||
          rowText.includes("opening balance") ||
          rowText.includes("closing balance") ||
          rowText.includes("total ")
        ) {
          console.log(`--- PARSER: Stopping page parsing at boundary row: "${rowText}"`);
          break;
        }
        
        const rowCells = Array(colBoundaries.length).fill("");
        
        r.items.forEach(item => {
          let bestColIdx = 0;
          let minDistance = Infinity;
          
          colBoundaries.forEach((col, idx) => {
            const dist = Math.abs(item.x - col.x);
            if (dist < minDistance) {
              minDistance = dist;
              bestColIdx = idx;
            }
          });
          
          if (rowCells[bestColIdx] !== "") {
            rowCells[bestColIdx] += " " + item.text;
          } else {
            rowCells[bestColIdx] = item.text;
          }
        });
        
        // Check if this row is a description continuation
        const cellDate = dateIdx !== -1 ? rowCells[dateIdx] : "";
        const hasDate = isValidDate(cellDate);
        const hasAmounts = amountIndices.some(idx => {
          const val = rowCells[idx];
          if (!val) return false;
          const cleaned = val.replace(/[₹$€£\s,]/g, "").trim();
          return cleaned !== "" && !isNaN(parseFloat(cleaned));
        });
        
        if (!hasDate && !hasAmounts && transactions.length > 0) {
          // Description/row continuation: merge into the previous transaction
          const lastTx = transactions[transactions.length - 1];
          if (descIdx !== -1) {
            const descVal = rowCells[descIdx];
            if (descVal) {
              lastTx.description += " " + descVal;
              lastTx[`col${descIdx}`] = (lastTx[`col${descIdx}`] || "") + " " + descVal;
            }
          }
          // Also append text in other columns to their respective locations in the parent transaction
          rowCells.forEach((cell, idx) => {
            if (idx !== descIdx && cell) {
              lastTx[`col${idx}`] = (lastTx[`col${idx}`] || "") + " " + cell;
            }
          });
          console.log(`--- PARSER: Appended description continuation to transaction ID ${lastTx.id}`);
        } else {
          // Create a new transaction row
          const newTx: Transaction = {
            id: String(txId++),
            date: hasDate ? cellDate : "-",
            description: descIdx !== -1 && rowCells[descIdx] ? rowCells[descIdx] : `Row ${txId - 1}`,
            chqRefNo: "-",
            debit: "",
            credit: "",
            balance: "",
          };
          
          rowCells.forEach((cell, idx) => {
            newTx[`col${idx}`] = cell;
          });
          
          transactions.push(newTx);
          console.log(`--- PARSER: Added row: ${rowCells.join(" | ")}`);
        }
      }
    }
    
    // If no transactions could be parsed, run layout text fallback
    if (transactions.length === 0) {
      console.warn("--- PARSER WARNING: Extracted 0 transactions via table tools. Attempting text fallback... ---");
      let allText = "";
      for (const page of pdf.pages) {
        const t3 = await page.extractTextRaw();
        const t1 = await page.extractText();
        allText += (t3 || t1 || "") + "\n";
      }
      
      await pdf.close();
      const result = parseTextFallback(allText, bank, pageCount);
      return result;
    }

    if (finalHeaders.length === 0) {
      finalHeaders = ["Column 1", "Column 2", "Column 3", "Column 4", "Column 5", "Column 6"];
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
