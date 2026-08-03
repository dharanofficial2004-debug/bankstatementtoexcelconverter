# Bank Statement to Excel Converter - SaaS Tool Analysis

## Overview
This is a full-stack SaaS application built with **Next.js 14** that converts bank statement PDFs into structured Excel, CSV, and JSON files. The tool uses AI-powered extraction with a freemium payment model powered by Razorpay.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Next.js 14 (App Router)
- **PDF Processing**: PDFExcavator + pdf-parse + PDF.js
- **Data Export**: XLSX (Excel), CSV
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI Extraction**: OpenAI API (gpt-5.6-luna)
- **Payments**: Razorpay
- **Utilities**: UUID, Lucide React icons

---

## Core Extraction Process

### 1. **PDF Upload & Initial Extraction** (`src/components/app/UploadZone.tsx`)
- Validates file type (PDF only) and size (max 20MB)
- Supports drag-and-drop and file picker
- Shows real-time error messages

### 2. **PDF Text Extraction** (`src/app/app/page.tsx` - `extractPdfText`)
- Uses **PDF.js** (unpkg CDN) with dynamic ES module import
- Extracts text from all pages (max 100 pages)
- Bypasses Webpack parsing with `/* webpackIgnore: true */`
- Returns text content with page count
- Metrics: word count, character count, page count

### 3. **AI-Powered Parsing** (`src/app/api/parse-bank-statement/route.ts`)

**Flow:**
1. Accepts raw PDF text via POST request
2. Sends to OpenAI API with specialized system prompt
3. Requests structured JSON output with transaction format
4. Handles retry logic (2 attempts)
5. Logs token usage to database for analytics

**System Prompt Instructions:**
```
Extract every transaction from bank statement text.
Return ONLY valid JSON with no markdown/comments.
Output format: { transactions: [{ date, description, debit, credit, balance }] }
```

**Response Processing:**
- Cleans markdown wrappers (```json blocks)
- Parses JSON response
- Normalizes transaction data (numbers, formatting)
- Re-classifies debit vs. credit based on balance trajectory
- Formats numbers with proper localization (en-US)
- Assigns unique IDs to each transaction

**Balance Re-classification Algorithm:**
- Tracks `lastBalance` while iterating transactions
- If current balance increased → Credit transaction
- If current balance decreased → Debit transaction
- Uses threshold of ±0.005 to avoid floating-point errors

### 4. **Fallback Text Parser** (`src/lib/parseStatement.ts`)
**When used:** If PDFExcavator table extraction yields 0 transactions

**Key Steps:**
1. **Bank Detection**: Uses regex patterns to identify bank (HDFC, SBI, ICICI, AXIS, etc.)
2. **Header Detection**: Scans first 30 lines for column headers
3. **Dynamic Column Mapping**: Identifies date, description, amounts, balance columns
4. **Row Extraction**: Uses regex to find transaction start lines
5. **Amount Parsing**: 
   - Removes currency symbols (₹, $, €, £)
   - Handles parentheses notation for negatives: (1,234.56) → -1234.56
   - Detects European format (1.234,56) vs standard format
6. **Description Continuation**: Multi-line transaction descriptions are merged
7. **Cheque/Reference Extraction**: Identifies CHQ/REF/UPI numbers
8. **Balance Inference**: Uses balance trajectory to classify debit/credit

**Supported Banks:**
- HDFC, SBI, ICICI, AXIS, KOTAK (India)
- CHASE, BARCLAYS, HSBC, BOA, WELLS FARGO (International)

### 5. **Advanced PDF Extraction** (`src/lib/parseStatement.ts` - `parseStatement`)

**Uses PDFExcavator for table detection:**

**Algorithm:**
1. Extract text content with coordinate data from PDF
2. Group items by y-coordinate (8pt tolerance for offset headers)
3. Sort rows top-to-bottom, items left-to-right
4. Merge close items (5pt tolerance) while preserving narrow columns
5. Identify header row (3+ columns with "Date", "Description", amounts)
6. Extract column boundaries from headers
7. Assign cells to columns by x-position proximity
8. Extract transactions row-by-row
9. Handle multi-line descriptions as continuations
10. Detect and skip boundary rows (totals, notes, summaries)
11. Output with dynamic headers and 6 column structure

**Fallback to Text Parser:** If 0 transactions extracted from layout

---

## Data Storage & Processing

### Transaction Structure
```typescript
interface Transaction {
  id: string;              // UUID
  date: string;            // YYYY-MM-DD or raw format
  description: string;     // Full transaction narrative
  debit: string;           // Formatted number or empty
  credit: string;          // Formatted number or empty
  balance: string;         // Account balance after transaction
  [key: string]: string;   // Dynamic column properties
}
```

### Output Formats

#### **CSV Export** (`src/lib/exportCsv.ts`)
- UTF-8 BOM for Excel compatibility
- Headers: #, Date, Description, Debit, Credit, Balance
- Proper CSV escaping for commas, quotes, newlines

#### **Excel Export** (`src/lib/exportExcel.ts`)
- Multi-sheet support (one sheet per uploaded file)
- Column widths: # (5), Date (12), Description (45), Debit/Credit/Balance (15)
- Safe sheet naming (removes invalid chars, ensures uniqueness)
- Parsed numbers for calculations

#### **JSON Export** (`src/app/api/export/route.ts`)
- Pretty-printed (2-space indent)
- Excludes internal `id` field
- Preserves all transaction properties

---

## Spreadsheet UI & Editing

### Features (`src/components/app/Spreadsheet.tsx`)

**Navigation & Selection:**
- Click cells to select
- Drag to create ranges
- Column/row headers for selecting entire column/row
- Keyboard navigation (arrow keys, Tab, Enter)

**Editing:**
- Double-click to edit
- F2 to edit current cell
- Delete/Backspace to clear
- Live validation of numeric formats

**Formatting:**
- Bold, Italic, Underline toggles
- Applies to selected range
- Stored in local state

**Advanced Operations:**
- Undo/Redo (Ctrl+Z, Ctrl+Y)
- Copy/Paste support (Ctrl+C, Ctrl+V)
- Clear range (Delete key)
- Sort by column (click header)
- Search/filter transactions

**Row Operations:**
- Add row at cursor
- Delete selected row
- Insert row above/below (context menu)

**Spreadsheet Features:**
- Column resizing (drag header border)
- Column reordering (toolbar buttons)
- 5 main columns: Date, Description, Debit, Credit, Balance
- Dynamic column detection from PDF
- Row number column

---

## Authentication & Authorization

### User Management
**Supabase Auth Integration:**
- Email-based authentication
- OAuth support (configured for redirects)
- Access tokens for API calls

### Auth Flow
1. User signs in via login modal
2. Session stored in browser
3. Access token included in API request headers: `Authorization: Bearer {token}`
4. Server-side token verification using Supabase Admin client
5. User ID extracted for usage tracking

### Usage Tracking
- Tracks `conversions_used` per user
- First conversion is FREE
- Subsequent conversions require payment
- Usage data stored in `user_usage` table

---

## Payment System

### Pricing Model (`src/lib/pricing.ts`)

**Dynamic Pricing Based on Document Size:**

```
Size Score = max(pages, ceil(words/300), ceil(chars/1500))

Tiers:
- Score 1-10:   $2.00
- Score 11-20:  $3.00
- Score 21-30:  $4.00
- Score 31-40:  $5.00
- Score 41-50:  $6.00
- Score 51-60:  $7.00
- Score 61-80:  $9.00
- Score 81+:    $12.00
```

**Labels:**
- 1-5 scores: "Small Document"
- 6-15: "Medium Document"
- 16-30: "Large Document"
- 31-50: "Very Large Document"
- 50+: "Extra Large Document"

### Payment Flow

1. **User hits export** → Not authenticated → Sign-in modal
2. **After sign-in** → Check `conversions_used`
3. **If used >= 1** → Show paywall modal with price
4. **User clicks "Pay & Unlock"** → Razorpay checkout
5. **Payment Success** → Verify signature & trigger conversion
6. **Increment usage counter** → Mark as paid

### Razorpay Integration (`src/app/api/payment/create-order/route.ts`, `verify/route.ts`)

**Create Order Endpoint:**
- Calculates price based on document metrics
- Creates Razorpay order
- Stores payment record in database
- Returns `orderId`, `amount`, `currency`

**Verify Endpoint:**
- Validates Razorpay signature
- Verifies payment with Razorpay API
- Updates payment record status
- Increments `conversions_used`

---

## Admin Dashboard

### Analytics (`src/app/api/admin/stats/route.ts`)

**Accessible with admin password: `Dharan1424#$`**

**Data Retrieved:**
1. All auth users from Supabase Auth
2. User usage records (conversions_used)
3. Token usage records (OpenAI token consumption)

**Metrics Calculated:**
- Total users
- Total conversions
- Total input/output tokens
- Estimated OpenAI cost (USD)
- Per-user breakdown

**Per-User Stats:**
- Email, creation date, last sign-in
- Conversions used
- Input/output tokens consumed
- Estimated cost
- Total requests made

---

## Key Technical Patterns

### 1. **Server-Side PDF Processing**
- All PDF extraction happens server-side for security
- Client sends PDF → Server processes → Returns JSON
- Avoids browser memory issues with large PDFs

### 2. **AI Response Validation**
- Retry logic with 2 attempts
- JSON parsing with error handling
- Markdown wrapper cleanup
- Type validation (array of transactions)

### 3. **Dynamic State Management**
- Multiple sheets support
- Merge/create new sheet options
- Active sheet switching
- Transaction ID preservation

### 4. **Error Handling**
- User-friendly toast messages
- Graceful fallbacks (text parser if table extraction fails)
- API error responses with descriptive messages
- Page limit enforcement (100 pages max)

### 5. **Performance Optimizations**
- Dynamic imports for PDF.js (CDN for browser)
- Memoization of filtered/sorted data
- Lazy loading of components
- Debounced column resizing

### 6. **Multi-Bank Support**
- Bank detection via regex patterns
- Dynamic header extraction
- Flexible column identification
- Handles various transaction date formats

---

## Testing Approach

### How Tests Would Work

**1. PDF Extraction Testing:**
- Mock PDF files with known content
- Verify text extraction accuracy
- Test page count accuracy
- Check character/word count metrics

**2. AI Parsing Testing:**
- Mock OpenAI responses with structured JSON
- Validate transaction structure
- Test balance re-classification logic
- Verify debit/credit classification

**3. Fallback Parser Testing:**
- Test with various bank statement formats
- Verify header detection
- Check transaction extraction
- Validate amount cleaning

**4. Data Export Testing:**
- Generate test transactions
- Verify CSV formatting (escaping, BOM)
- Check Excel multi-sheet structure
- Validate JSON formatting

**5. Payment Flow Testing:**
- Mock Razorpay API responses
- Test signature verification
- Verify usage counter increment
- Check error handling

**6. UI Component Testing:**
- Spreadsheet cell editing
- Copy/paste functionality
- Sort/filter operations
- Undo/redo stack

**7. Authentication Testing:**
- Token validation
- User session persistence
- API authorization checks
- Admin password verification

---

## Database Schema

### Key Tables

**user_usage**
- user_id (UUID, FK to auth.users)
- conversions_used (INT, default 0)
- updated_at (TIMESTAMP)

**token_usage**
- user_id (UUID, nullable)
- model (VARCHAR)
- input_tokens (INT)
- output_tokens (INT)
- total_tokens (INT)
- estimated_total_cost_usd (DECIMAL)
- created_at (TIMESTAMP)

**payment_records** (assumed)
- user_id (UUID)
- order_id (VARCHAR, Razorpay)
- payment_id (VARCHAR, Razorpay)
- amount_paise (INT)
- status (VARCHAR: pending, success, failed)
- created_at (TIMESTAMP)

---

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-5.6-luna

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## Summary

This SaaS tool demonstrates a complete pipeline for:
1. **PDF processing** with fallback strategies
2. **AI-powered data extraction** with retry logic
3. **User authentication** and usage tracking
4. **Dynamic pricing** based on document metrics
5. **Payment integration** with Razorpay
6. **Rich spreadsheet editing** with formatting options
7. **Multi-format export** (Excel, CSV, JSON)
8. **Admin analytics** for business intelligence

The architecture prioritizes **robustness** (fallback parsers), **user experience** (multiple export formats, editing UI), and **monetization** (freemium model with clear paywall).
