# Requirements Document

## Introduction

This document captures requirements for a comprehensive architecture upgrade of the bank-statement-to-Excel SaaS application. The system is a Next.js 14 application deployed on Vercel, using Supabase (Postgres + Auth), Razorpay for payments, Vertex AI / Gemini for bank statement parsing, and an Affitor affiliate integration.

The upgrade hardens existing flows rather than replacing them. It replaces client-side entitlement decisions (localStorage) with server-issued guest sessions, introduces durable background processing via a transactional outbox, adds granular Gemini usage accounting, secures the admin dashboard, and improves the /app UI flow from file-select through server-authorized extraction to async job polling and result download. All existing paid plans (Lifetime, Pay-as-you-go), purchase history, unused credits, affiliate attribution and marketing pages are preserved unchanged.

The current codebase has partial implementations of these capabilities in `src/lib/identity.ts`, `src/lib/jobs.ts`, `src/lib/entitlements.ts`, `src/lib/workerProcess.ts`, `src/lib/queue.ts`, `src/lib/vertexGemini.ts`, `src/lib/chunking.ts`, `src/lib/rateLimit.ts`, and migrations 006–008. These requirements define the correct, complete behavior that implementation must converge on.

---

## Schema Naming Clarification

Two conflicting `008_*.sql` migration files exist in the repository. **The implementation must not assume either is applied without first inspecting the live database.** Before writing any migration 009, the implementer SHALL run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` on the live Supabase instance and compare the result against the tables defined in both files.

**Most likely applied state:** `008_jobs_ledger_attribution.sql` is the file referenced by live application code (`src/lib/jobs.ts`, `src/lib/workerProcess.ts`, `src/lib/entitlements.ts`). Its table names are used in this spec:

| Table used in this spec | Present in `008_jobs_ledger_attribution.sql` | Present in `008_jobs_reservations_accounting.sql` |
|---|---|---|
| `entitlement_reservations` | Yes | No (`usage_reservations` instead) |
| `job_chunks` | Yes | No (`conversion_chunks` instead) |
| `rate_limit_buckets` + `hit_rate_limit()` | Yes | No (`rate_limit_windows` + `bump_rate_limit()`) |
| `gemini_pricing` | Yes | No (`model_pricing` instead) |
| `entitlements_applied_at` on `payments` | Yes (plural) | Yes (singular `entitlement_applied_at`) |

**Required pre-migration check:** If live inspection shows `usage_reservations` exists instead of `entitlement_reservations`, the second file was applied and migration 009 must adapt accordingly — adding `entitlement_reservations` as a view alias or renaming the table. Never drop a table that may hold live reservation data without first confirming it is empty.

Migration 009 (if needed) MUST use `IF NOT EXISTS` on every DDL statement. It MUST NOT duplicate tables or indexes already created by whichever 008 file was actually applied.

The `payments` table column for idempotent payment application is `entitlements_applied_at` (plural, as used in `applyPayment.ts` and `reconcileRazorpayCapture()`). If the live schema has `entitlement_applied_at` (singular), migration 009 must rename it rather than add a duplicate.

---

## Unresolved Business Decisions

The following decisions require explicit answers from the product owner before implementation:

1. **Retry limits for paid jobs** — The 3-attempt-per-chunk limit applies uniformly. Should PAYG or Lifetime users get more retries or a longer timeout before permanent failure?
2. **Result retention period** — `result_expires_at` defaults to 90 days. Is this agreed, or should it be configurable per plan?
3. **Active-job text retention window** — `extracted_text_expires_at` is set to 2 hours at job creation. If a job is still `retrying` at the 2-hour mark, `extracted_text` on `conversion_jobs` will be purged but `job_chunks.input_text` will still exist and the worker can continue. **Confirm**: is purging `conversion_jobs.extracted_text` at 2 hours acceptable even for in-flight jobs, given that chunks hold the split text?
4. **Export authentication for guests** — Every export currently requires a Supabase session (HTTP 401 for `ste_gst`-only requests). Should a guest with a valid `ste_gst` cookie be allowed to re-download their own completed result before signing up? If yes, the Export_API must verify cookie ownership, not require a JWT.
5. **Rate limit production values** — The values in `src/lib/rateLimit.ts` (`LIMITS`) are code constants. Confirm the agreed production values before deployment. They are not stored in the database.
6. **Historical conversion metrics** — `user_usage.conversions_used` records conversions before `conversion_jobs` existed. Should these appear in the admin dashboard as a separate "Legacy" series, or be excluded entirely?
7. **Acquisition-source "Other" field storage** — The free-text "Please specify" answer when "Other/Others" is selected on the signup form: migration 008 added `user_usage.profession_detail`. Confirm this is the correct destination. The `profession` column (from migration 004) holds the selected option (e.g., "Others"); `profession_detail` holds the free-text answer. These are two separate fields and must not be conflated.
8. **Worker infrastructure** — The Vercel worker has a 60-second max duration. Cloud Run removes that limit. Confirm whether Cloud Run is required for the initial release or whether the Vercel worker plus outbox drain is sufficient.

---

## Glossary

- **App**: The Next.js 14 application.
- **Browser**: The user's web browser; performs PDF reading, text extraction, and OCR locally.
- **Server**: Next.js API routes running on Vercel (server-only code, never exposed to browser).
- **Supabase**: The hosted Postgres + Auth backend accessed via `supabaseAdmin` (service role, server-only) or the anon client (browser).
- **Worker**: The `/api/internal/worker` route (or a future Cloud Run service) that processes conversion jobs by calling Vertex AI / Gemini.
- **Cloud Tasks**: Google Cloud Tasks queue used for durable, authenticated job dispatch.
- **Outbox**: The `job_outbox` Postgres table acting as a transactional outbox for reliable job enqueue.
- **Guest_Session**: A server-issued, opaque, HttpOnly cookie (`ste_gst`) identifying an anonymous user; backed by the `guest_sessions` table.
- **Identity**: Either a Supabase-authenticated user (`ownerType = 'user'`) or a Guest_Session holder (`ownerType = 'guest'`), as resolved by `resolveIdentity()` in `src/lib/identity.ts`.
- **Entitlement**: The set of allowed operations for a given Identity: Lifetime (unlimited), Pay-as-you-go credits, or a one-time free trial.
- **Trial**: One free extraction + conversion allowed per Identity before requiring signup and/or payment. Text trial: pages 1–3. OCR trial: page 1 only.
- **Reservation**: A row in `entitlement_reservations` that atomically holds an entitlement slot while a job is in-flight.
- **Conversion_Job**: A row in `conversion_jobs` representing one extraction-to-result lifecycle.
- **Chunk**: A bounded slice of extracted text processed by one Gemini call, tracked in `job_chunks`.
- **Gemini_Attempt**: A row in `gemini_attempts` recording every Gemini API call including retries, token counts, cost estimates, and outcomes.
- **Support_Ref**: An opaque, short reference ID on a `conversion_jobs` row for customer error messages, linked to full diagnostics visible only in the admin dashboard.
- **Affitor**: Third-party affiliate network integrated via `@affitor/sdk`; tracks leads and sales using the `affitor_click_id` cookie.
- **Outbox_Drain**: The process (`/api/internal/outbox`) of reading pending `job_outbox` rows and re-delivering them to the Worker.
- **Persistent_Conversion_URL**: A stable URL of the form `/preview/{jobId}` that restores a completed result after page refresh without a new Gemini call.
- **Admin_User**: A Supabase user with a row in `admin_users`, verified by `requireAdminUser()` in `src/lib/identity.ts`.
- **Touch_Attribution**: A JSONB snapshot of UTM params, referrer, landing URL, signup URL, acquisition country, and timestamp; stored as `first_touch` and `last_touch` in `guest_attribution` and `user_attribution`.
- **PAYG**: Pay-as-you-go plan; each conversion consumes one `paid_credits` unit from `user_usage`.
- **Lifetime**: Unlimited conversion plan; no credits consumed.
- **entitlements_applied_at**: The `timestamptz` column on `payments` that records when `apply_verified_payment()` successfully applied entitlements. Its presence (non-NULL) is the sole idempotency gate for payment application.

---

## Requirements

### Requirement 1: Browser-Side PDF Processing

**User Story:** As a user, I want my PDF to be read and text-extracted entirely in my browser, so that my original file never leaves my device.

#### Acceptance Criteria

1. THE Browser SHALL load pdfjs-dist from jsDelivr CDN and serve the PDF worker from `/public/pdf.worker.min.mjs` on the App's own domain, so no external CDN dependency exists for the worker.
2. WHEN a user selects a PDF, THE Browser SHALL display the filename, file size, a "Remove" button, and an "Extract" button. It SHALL NOT read any PDF pages, scan any content, or determine whether the file is text-based or scanned until after the user clicks "Extract" and `POST /api/extract/authorize` returns `{ ok: true }`.
3. WHEN a PDF requires a password, THE Browser SHALL prompt the user for the password via a modal, pass it to pdfjs locally, and SHALL NOT log or transmit the password to any server endpoint.
4. WHEN a PDF has more than 100 pages, THE Browser SHALL reject it locally with the message "File has too many pages. Maximum page limit is 100." before any server call is made.
5. THE Browser SHALL display a compact preview of the extracted text content after extraction completes and before the user initiates conversion.
6. WHEN an image file (not PDF) is selected, THE Browser SHALL display the trial label or paid limits and show the "Extract" button; it SHALL NOT attempt OCR until after authorization.
7. IF extraction fails locally (corrupt file, unsupported encoding, CDN block, timeout), THEN THE Browser SHALL display a short nontechnical message, a "Retry extraction" button, and a "Choose another PDF" button.
8. THE Browser SHALL never store raw PDF bytes in localStorage, sessionStorage, IndexedDB, or any browser-side persistence mechanism.

---

### Requirement 2: Extraction Authorization API

**User Story:** As a server operator, I want every extraction to be authorized server-side before the browser processes any pages, so that trial limits and paid entitlements are enforced at the server, not the client.

#### Acceptance Criteria

1. WHEN the user clicks "Extract", THE Browser SHALL call `POST /api/extract/authorize` FIRST. The browser SHALL NOT read any PDF pages or perform any OCR until it receives `{ ok: true }` from this API.
2. THE Extraction_Authorization_API SHALL accept `{ kind: "text" | "ocr", filename: string, fileSize: number }` and SHALL resolve the caller's Identity via `resolveIdentity()` from `src/lib/identity.ts`.
3. THE Extraction_Authorization_API SHALL call `loadEntitlement()` to check the caller's entitlement and SHALL reject with HTTP 402 and `{ ok: false, code: "trial_complete" }` if the Identity has no remaining trial, no paid credits, and no Lifetime plan.
4. THE Extraction_Authorization_API SHALL enforce per-IP and per-Identity rate limits using `allowRate()` / `hit_rate_limit` RPC on `rate_limit_buckets` before creating any reservation. The IP limit, guest limit, and user limit are defined in `src/lib/rateLimit.ts` as configurable constants (`LIMITS`).
5. WHEN a trial Identity already has a `reserved` Reservation in `entitlement_reservations` with `status = 'reserved'` and a linked job in `extract_authorized` state, THE Extraction_Authorization_API SHALL update that job's metadata (filename, fileSize, kind, pages_authorized, token_budget) and return it rather than creating a new reservation and job.
6. THE Extraction_Authorization_API SHALL create the `conversion_jobs` row and the `entitlement_reservations` row inside a single Supabase RPC call (`authorize_extraction`) that executes as a database transaction. For PAYG: the RPC SHALL call `consume_paid_credit()` and insert both rows atomically; if any step fails the transaction rolls back, leaving credits and reservations unchanged. For trial: the RPC SHALL insert the Reservation and job atomically; a unique-constraint violation on the trial index is treated as a reuse signal and the existing rows are returned. No compensating rollback in application code is required because the database transaction guarantees atomicity.
7. THE Extraction_Authorization_API SHALL return `{ ok: true, conversionId, maxPages, maxChars, isTrial, kind }` on success so the browser knows its server-authorized limits.
8. FOR a trial Identity, `maxPages` SHALL be `TRIAL_TEXT_PAGES` (3) for `kind = "text"` and `TRIAL_OCR_PAGES` (1) for `kind = "ocr"`, as defined in `src/lib/entitlements.ts`.
9. FOR a paid Identity (Lifetime or PAYG with credits), `maxPages` SHALL be `PAID_MAX_PAGES` (100) and `maxChars` SHALL be `PAID_MAX_CHARS` (400,000), as defined in `src/lib/entitlements.ts`.
10. THE Extraction_Authorization_API SHALL count `conversion_jobs` with `status IN ('queued', 'processing', 'retrying', 'validating')` for the same owner and SHALL reject with HTTP 409 and `{ ok: false, code: "server_busy" }` if the count equals or exceeds `LIMITS.concurrentJobs` (currently 2).
11. WHEN a guest has no existing `ste_gst` cookie, `resolveIdentity()` SHALL create a new `guest_sessions` row and set the `ste_gst` Secure/HttpOnly/SameSite=Lax cookie in the response. The cookie value is `{sessionId}.{HMAC-SHA256}` signed with `GUEST_SESSION_SECRET`.
12. THE Browser SHALL display "Free trial: first 3 text pages or 1 scanned page." when `isTrial = true` is returned.

---

### Requirement 3: Browser Extraction Enforcement

**User Story:** As a server operator, I want the browser to process only the pages authorized by the server, so that a trial user cannot extract more pages than the server has reserved entitlement for.

#### Acceptance Criteria

1. AFTER receiving `{ ok: true, maxPages, kind }` from the authorization API, THE Browser SHALL process only pages 1 through `maxPages`. Extraction STOPS when the page limit is reached; the browser SHALL NOT extract the full document then truncate.
2. WHEN `maxPages = 1` and `kind = "ocr"`, THE Browser SHALL render and OCR only page 1 and SHALL NOT request, render, or OCR any subsequent pages.
3. WHEN `kind = "text"` is authorized and the browser discovers during extraction that a page within the authorized range has fewer than 80 non-whitespace characters (image-only page), THE Browser SHALL STOP text extraction. It SHALL then call `POST /api/extract/authorize` again with `kind = "ocr"` and the SAME `conversionId` in the request body. The server SHALL reuse the existing Reservation and update the `conversion_jobs` row's `extraction_kind`, `pages_authorized`, and `token_budget` in place — no new credit is consumed and no new reservation is created. THE Browser SHALL then OCR only pages 1 through the OCR `maxPages` returned. THE Browser SHALL NOT silently OCR more pages than the OCR authorization permits.
4. WHEN the re-authorization for OCR (criterion 3) returns `{ ok: false }` (e.g., the trial was already consumed by the text authorization), THE Browser SHALL display the appropriate error message and SHALL NOT proceed with OCR.
5. THE Browser SHALL disable the "Extract" button immediately after a successful authorization response and SHALL re-enable it only if extraction fails or the user selects a new file.
6. WHEN extraction completes within the authorized limits, THE Browser SHALL change the primary button label from "Extract" to "Convert" and SHALL show the compact extracted content preview (character count, page count, brief text excerpt).
7. THE Browser SHALL include a "Choose another PDF" affordance after extraction completes when `GET /api/session` returns `trialAvailable = true` or the user has a paid plan.

---

### Requirement 4: Convert API and Job Lifecycle

**User Story:** As a user, I want to submit my extracted text and receive a persistent job ID so that I can track progress and retrieve my result even after a page refresh.

#### Acceptance Criteria

1. WHEN the user clicks "Convert", THE Browser SHALL POST `{ conversionId, text, pagesSubmitted, kind }` to `/api/convert`.
2. THE Convert_API SHALL verify the caller's Identity via `resolveIdentity()`, confirm ownership of the referenced `conversion_jobs` row via `assertJobOwner()`, and reject with HTTP 404 if the job is not found or does not belong to the caller.
3. THE Convert_API SHALL only accept jobs with `status IN ('extract_authorized', 'failed')`; for jobs already in `queued`, `processing`, `retrying`, or `validating` state, it SHALL return `{ ok: true, jobId, already: true, status }` without creating duplicate chunks.
4. THE Convert_API SHALL enforce two independent server-side input limits against the submitted text:
   - **Character limit** (`char_budget`): the maximum character count authorised at extraction time, stored on the `conversion_jobs` row as `token_budget` (current column name) and derived from `TRIAL_MAX_CHARS_TEXT`, `TRIAL_MAX_CHARS_OCR`, or `PAID_MAX_CHARS` in `src/lib/entitlements.ts`. If the submitted text length exceeds this value, the API SHALL reject with HTTP 400 and `{ ok: false, code: "input_too_large" }`.
   - **Token budget** (Gemini tokens): an estimated token count derived by the worker at processing time from `gemini_attempts.input_tokens`. This is not enforced at Convert time; it is enforced per-chunk in the Worker before each Gemini call (see R10.4).

   The API SHALL NOT re-call `loadEntitlement()` to re-check current credit availability; the existing reservation is sufficient authorization. Browser-reported page counts are untrusted and SHALL NOT override the character limit check.
5. THE Convert_API SHALL enforce the per-Identity conversion rate limit via `allowRate()` with the `LIMITS.convertHour` window before proceeding.
6. THE Convert_API SHALL split the submitted text into `job_chunks` using `splitExtractedText()` in `src/lib/chunking.ts` (target ~12,000 chars/chunk, 4-line overlap) and store each chunk's `input_text` immutably at write time. Once written, `job_chunks.input_text` SHALL NOT be updated during retries; the Worker always reads the saved immutable input for each chunk. The API SHALL insert the chunks with `status = 'pending'`, update the job to `status = 'queued'`, and call `enqueueJob()` to write the `job_outbox` row and dispatch.
7. THE Convert_API SHALL return `{ ok: true, jobId, status: "queued" }` within the Vercel 30-second request timeout.
8. THE Browser SHALL navigate to `/preview/{jobId}` after receiving `{ ok: true, jobId }`.
9. THE Browser SHALL poll `GET /api/jobs/{id}` and display human-readable status labels: "In queue", "Processing", "Retrying — we're working on it", "Validating", "Ready", or "Something went wrong".
10. THE Browser SHALL display real progress using `chunksDone / chunksTotal` from the job status response and SHALL NOT display invented progress percentages.
11. WHEN `status = 'ready'`, THE Browser SHALL show the transaction preview, any `validationNotices`, and Export buttons (XLSX, CSV).
12. WHEN a user navigates away and returns to `/preview/{jobId}`, THE App SHALL restore the result from the server without triggering a new Gemini call.

---

### Requirement 5: Guest Session and Trial Entitlement

**User Story:** As an anonymous visitor, I want to use the free trial without signing up, and have my trial state carried over when I create an account, so I am not granted a second free conversion on signup.

#### Acceptance Criteria

1. THE Server SHALL issue a `ste_gst` Secure/HttpOnly/SameSite=Lax cookie via `resolveIdentity()` on the first API call that cannot authenticate a Supabase session, backed by a row in `guest_sessions`.
2. THE Server SHALL sign the cookie value as `{sessionId}.{HMAC-SHA256}` using `GUEST_SESSION_SECRET` and SHALL verify the HMAC signature via `parseGuestToken()` on every subsequent request before trusting the session ID.
3. THE Browser SHALL never read, write, or make entitlement decisions based on localStorage, sessionStorage, or any client-side storage for trial availability, plan status, or credit counts.
4. `GET /api/session` SHALL return `{ ownerType, trialAvailable, trialFinished, plan, paidCredits, label, conversionsUsed }`. THE Browser SHALL use these server-provided values to display the entitlement label and gate the "Extract" and "Convert" buttons.
5. THE Extraction_Authorization_API SHALL enforce the unique partial index `idx_entitlement_one_active_trial` on `entitlement_reservations(owner_type, owner_id)` so that at most one `reserved` trial Reservation can exist per Identity at any time.
6. WHEN a guest's conversion job reaches `status = 'ready'`, THE Worker SHALL atomically set `guest_sessions.trial_used = true` and `entitlement_reservations.status = 'committed'` in `commitReservation()`.
7. WHEN a guest whose `trial_used = true` visits `/app` and no active paid entitlement exists, THE App SHALL display "Your free trial is finished — upgrade to continue." and SHALL NOT render the Extract flow.
8. WHEN a guest clicks Download, THE Export_API SHALL reject the request with HTTP 401 and a redirect hint to `/auth/login` unless the caller presents a valid Supabase session.
9. WHEN a guest signs up, THE Auth_Callback SHALL call `link_guest_session_to_user(sessionId, userId)` so trial state from `guest_sessions` is merged into `user_usage` without granting an additional free conversion.
10. THE Server SHALL bind every `conversion_jobs` row to its owner via `owner_type` and `owner_id`; a different Identity guessing a job ID SHALL receive HTTP 404.
11. THE Server SHALL enforce that a single `(ip_hash, user_agent_hash)` combination has no more than 5 active, non-expired, non-trial-used guest sessions, as checked inside `reserve_guest_trial()` in migration 007. This is an abuse prevention measure, not a per-device identity guarantee; the system SHALL acknowledge honestly that storage clearing can create new guest sessions.
12. THE Server SHALL allow up to 3 chunk retry attempts per chunk (as set by `attempt_count >= 3` in `workerProcess.ts`) before permanently failing a trial job, and SHALL NOT permanently revoke the trial entitlement for transient infrastructure failures. Permanent failure triggers `releaseReservation()`, which sets the reservation to `released` but does not re-grant the trial.

---

### Requirement 6: Durable Background Processing

**User Story:** As a system operator, I want all Gemini work to run in a durable, resumable background process so that long-running jobs survive request timeouts, retries, and transient worker failures.

#### Acceptance Criteria

1. WHEN a job is queued, `enqueueJob()` in `src/lib/queue.ts` SHALL insert a row into `job_outbox` with `status = 'pending'` as part of the same logical operation that updates the job to `status = 'queued'`. If the outbox insert fails, `enqueueJob()` SHALL throw so the Convert API can surface the error and leave the job in `extract_authorized` state for a retry.

2. **Worker authentication — one scheme, consistently applied.** Choose exactly one of:
   - **Shared-secret only** (current code): The worker URL is not public. Every dispatch (direct fetch, outbox drain, Cloud Tasks) sets `Authorization: Bearer {WORKER_SHARED_SECRET}`. The Worker checks only this header. Cloud Tasks is configured to forward the header rather than use OIDC.
   - **OIDC only** (Cloud Tasks native): Cloud Tasks attaches an OIDC token signed by `CLOUD_TASKS_SERVICE_ACCOUNT`. The Worker validates the OIDC token against Google's public keys using the worker URL as the audience. No `WORKER_SHARED_SECRET` header is sent or checked. The direct-fetch fallback and outbox drain cannot use OIDC and are therefore disabled when this scheme is active.

   The implementation MUST NOT configure Cloud Tasks to send both an OIDC token and a `Bearer {WORKER_SHARED_SECRET}` header simultaneously, because the two schemes have different trust models and combining them provides no additional security while creating confusion about which check is authoritative. The chosen scheme SHALL be documented in `.env.example` with a comment explaining the tradeoff.

3. THE Queue_Module SHALL support both Cloud Tasks dispatch (when `CLOUD_TASKS_QUEUE`, `GOOGLE_CLOUD_PROJECT_ID`, and `CLOUD_TASKS_LOCATION` env vars are set) and a direct `fetch` POST fallback. The fallback is fire-and-forget; the outbox drain is the durability backstop.

4. THE Worker SHALL acquire a lease on the `conversion_jobs` row by issuing a conditional `UPDATE … WHERE status IN ('queued', 'retrying') AND (lease_expires_at IS NULL OR lease_expires_at < now())` that sets `status = 'processing'`, `lease_owner`, and `lease_expires_at` to `now() + 90s`. If the conditional update matches zero rows (already leased by another instance or in wrong state), the Worker SHALL return `{ ok: true, code: "not_leased" }` without processing.

5. WHILE processing, THE Worker SHALL heartbeat the lease every ~30 seconds by issuing `UPDATE conversion_jobs SET lease_expires_at = now() + 90s WHERE id = ? AND lease_owner = {this_worker_id}`. If the heartbeat update matches zero rows, a different instance has claimed the job; the Worker SHALL abort immediately without calling Gemini or committing the reservation.

6. THE Worker SHALL process `job_chunks` rows in ascending `seq` order. For any chunk with `status = 'succeeded'` and a non-NULL `output_json`, THE Worker SHALL skip without calling Gemini.

7. WHEN a Gemini call fails or returns invalid JSON, THE Worker SHALL: update the chunk to `status = 'failed'`; compute `delay = min(60s, 4s × 2^attempt_count) + jitter(0–40%)`; set `retry_after = now() + delay` on the job; update the job to `status = 'retrying'`; release the lease (`lease_owner = NULL, lease_expires_at = NULL`); and return. It SHALL NOT permanently fail the job until `attempt_count >= 3` for that chunk.

8. **Retry redispatch.** WHEN a job is set to `status = 'retrying'`, the Worker SHALL insert a new `job_outbox` row (with `next_attempt_at = retry_after`) so the outbox drain will re-deliver the job after the backoff delay. The Worker SHALL NOT rely on an external scheduler or assume the same Cloud Tasks invocation will retry; the outbox is the durable retry mechanism.

9. **Stale-lease recovery.** THE Outbox_Drain SHALL detect jobs in `status = 'processing'` whose `lease_expires_at < now()` and reset them to `status = 'queued'` with `lease_owner = NULL` before re-dispatching. This handles worker crashes where no `retrying` state was written.

10. **Uncertain-state exit path.** WHEN a chunk has an open `gemini_attempts` row with `status = 'started'` that was started less than 70 seconds ago, THE Worker SHALL set the job to `status = 'uncertain'`, mark the chunk `status = 'uncertain'`, release the lease, and return. The Outbox_Drain SHALL treat `uncertain` jobs like `retrying` jobs: after a fixed timeout (configurable, default 120 seconds after the uncertain transition), it SHALL reset the uncertain chunk to `status = 'failed'` and the job to `status = 'retrying'` with `retry_after = now()`, then re-dispatch via a new outbox row. This ensures `uncertain` is a temporary state, not a permanent one.

11. WHEN all chunks reach `status = 'succeeded'`, THE Worker SHALL: (a) verify current lease ownership by checking `lease_owner = {this_worker_id}` on the job row; (b) if ownership is confirmed, call `mergeChunkTransactions()` and `validateTransactions()`, then execute `commitReservation()` and the job `status = 'ready'` update inside a single database transaction guarded by `WHERE id = ? AND lease_owner = {this_worker_id} AND status = 'processing'`; (c) if the guarded update touches zero rows (lease was lost), abort without writing `result_json` or committing the reservation.

12. WHEN a job permanently fails (all retries exhausted on a chunk), THE Worker SHALL: (a) verify current lease ownership; (b) if confirmed, call `releaseReservation()` and set `status = 'failed'` inside a single database transaction guarded by `WHERE id = ? AND lease_owner = {this_worker_id}`; (c) if the guard fails, return without releasing the reservation — the stale-lease recovery path will handle it.

13. THE Outbox_Drain (`POST /api/internal/outbox`) SHALL: (a) select `job_outbox` rows with `status = 'pending'` and `next_attempt_at <= now()`; (b) perform stale-lease recovery (criterion 9) and uncertain recovery (criterion 10); (c) dispatch each pending row via the worker URL using the same single authentication scheme chosen in criterion 2; (d) update `next_attempt_at` using backoff `min(15 min, 2^attempts × 4s)` on failure. THE Outbox_Drain MUST be invoked on a regular schedule. In shared-secret mode it SHALL be triggered by a Vercel Cron job (configured in `vercel.json`) at least every 60 seconds. In OIDC-only mode Cloud Tasks handles delivery and the Outbox_Drain is invoked only for stale-lease and uncertain recovery, also via Vercel Cron. The cron endpoint SHALL be protected with the same `WORKER_SHARED_SECRET` check as the worker endpoint.

---

### Requirement 7: Gemini Usage Accounting

**User Story:** As a system operator, I want every Gemini API call recorded with full token counts, cost estimates, and provenance, so that I can audit AI expenditure and diagnose failures accurately.

#### Acceptance Criteria

1. BEFORE every Gemini API call, THE Worker SHALL call `recordAttempt()` to insert a row into `gemini_attempts` with: `status = 'started'`, `started_at`, `job_id`, `chunk_id`, `owner_type`, `owner_id`, `attempt_no`, `operation`, `model` (currently `VERTEX_MODEL = "gemini-2.5-flash-lite"`), `location` (`VERTEX_LOCATION`), `endpoint`, `pricing_version` (`PRICING_VERSION`), and `idempotency_key`. The `idempotency_key` SHALL be `SHA-256(jobId:chunkSeq:attemptNo).slice(0,32)` computed via `newIdempotencyKey()` in `src/lib/vertexGemini.ts`.
2. AFTER every Gemini API call (success or failure), THE Worker SHALL call `completeAttempt()` to update the row with: `ended_at`, `duration_ms`, `input_tokens`, `output_tokens`, `total_tokens`, `cached_tokens`, `thinking_tokens`, `raw_usage`, `status`, `finish_reason`, `sanitized_error`, `retry_reason`, `provider_response_id`, and `estimated_cost_usd`.
3. WHEN the Gemini response does not include usage metadata (or `usageMetadata` is absent), THE Worker SHALL set `input_tokens`, `output_tokens`, and `total_tokens` to NULL and leave `tokens_known` as its default (`false`). These values SHALL NOT be substituted with zero.
4. THE Worker SHALL use `estimateCostUsd()` from `src/lib/vertexGemini.ts` for cost estimates: `(input_tokens / 1_000_000) × 0.10 + (output_tokens / 1_000_000) × 0.40`. These rates are loaded from the `gemini_pricing` table (version `PRICING_VERSION`) and represent internal estimates only, not provider invoices.
5. THE Worker SHALL persist `gemini_attempts` rows synchronously (not fire-and-forget) before returning from `processJob()`, so accounting survives worker crashes.
6. THE Worker SHALL create a separate `gemini_attempts` row for every retry attempt, not update an existing one. Each attempt for the same chunk has a distinct `attempt_no` and `idempotency_key`.
7. THE Worker SHALL NOT include bank statement text content (extracted text, chunk input, or transaction data) in any log output. Diagnostic fields SHALL use sanitized error codes, `support_ref`, and `job_id` references only.
8. The `gemini_pricing` table (created in `008_jobs_ledger_attribution.sql`) is the authoritative source for pricing versions. New pricing versions SHALL be inserted via migration using `ON CONFLICT (version) DO NOTHING`. Pricing in `vertexGemini.ts` constants and `gemini_pricing` rows MUST agree.

---

### Requirement 8: Payment Safety and Razorpay Integration

**User Story:** As a system operator, I want all payment events to be validated server-side and applied exactly once, so that no user can gain entitlements through frontend manipulation or duplicate events.

#### Acceptance Criteria

1. THE Payment_CreateOrder_API SHALL validate that `plan` is one of `'lifetime'` or `'per_conversion'` before creating a Razorpay order; any other value SHALL be rejected with HTTP 400.
2. THE Payment_CreateOrder_API SHALL map plans to server-side prices from `src/lib/pricing.ts` and SHALL never accept a price or amount from the browser request body.
3. THE Payment_Verify_API SHALL verify the Razorpay signature using `HMAC-SHA256(orderId|paymentId, RAZORPAY_KEY_SECRET)` with `crypto.timingSafeEqual` before querying or updating any database row.
4. THE Payment_Verify_API SHALL enforce ownership: the `payments` row's `user_id` MUST match the authenticated user's ID; mismatches SHALL be rejected with HTTP 403.
5. THE Payment_Verify_API SHALL use `entitlements_applied_at` (the column name in `applyPayment.ts` and `008_jobs_ledger_attribution.sql`) as the idempotency gate. If `entitlements_applied_at IS NOT NULL`, entitlements have already been granted; the call SHALL return `{ success: true, idempotent: true }` without re-applying. `payment_status = 'paid'` alone is not sufficient for idempotency; the `entitlements_applied_at` column is the definitive gate.
6. THE `apply_verified_payment()` Supabase RPC SHALL check `entitlements_applied_at IS NOT NULL` first (returning `'already_applied'`) before checking `payment_status`. It uses `SELECT … FOR UPDATE` to prevent concurrent applications.
7. THE Affiliate_Razorpay_Webhook (`/api/affiliate/razorpay-webhook`) SHALL validate the `x-razorpay-signature` header using `HMAC-SHA256(rawBody, RAZORPAY_AFFITOR_WEBHOOK_SECRET)` before processing any event.
8. THE Payment system SHALL rely on the unique partial index `idx_payments_razorpay_payment_id_unique` on `razorpay_payment_id` (WHERE `razorpay_payment_id IS NOT NULL`) to prevent duplicate `razorpay_payment_id` values.
9. WHEN a `payment.captured` webhook event arrives, THE Affiliate_Webhook SHALL call `reconcileRazorpayCapture()` from `src/lib/applyPayment.ts`, which updates `payment_status = 'paid'` only if it is not already `'paid'`, then calls `applyPaidPayment()`. The idempotency gate inside `apply_verified_payment()` prevents double grants.
10. THE Payment system SHALL preserve `affitor_click_id` from the Razorpay order notes through to the `payments` row and to the Affitor sale tracking call.
11. THE Server SHALL block `/api/usage/consume` (already returns HTTP 410) and SHALL never grant entitlements through that endpoint.

---

### Requirement 9: Usage Reservation and Credit Safety

**User Story:** As a system operator, I want credits and trial slots to be reserved before AI work begins and committed or released exactly once on job completion, so that users are never double-charged and credits are never lost to infrastructure failures.

#### Acceptance Criteria

1. **PAYG reservation atomicity.** THE `authorize_extraction` RPC (see R2.6) SHALL consume the credit and insert both the Reservation and job rows inside a single database transaction. If any step fails the whole transaction rolls back; no compensating application code is needed.

2. **Trial reservation atomicity.** The `authorize_extraction` RPC SHALL insert the trial Reservation and job row inside the same single database transaction. A unique-constraint violation on the trial index causes the transaction to abort; the application layer catches this and re-reads the existing reservation/job to return.

3. **Commit on success — lease-guarded.** WHEN a job completes successfully, THE Worker SHALL call `commitReservation()` only after confirming the lease is still owned by the current worker instance (see R6.9). `commitReservation()` issues `UPDATE entitlement_reservations SET status = 'committed' WHERE id = ? AND status = 'reserved'` and the companion `UPDATE guest_sessions SET trial_used = true …` (for guest trial jobs) inside a single database transaction. If the lease heartbeat has already been lost, `commitReservation()` SHALL abort rather than commit a reservation for a job another worker may be processing.

4. **Release on permanent failure — atomic with credit restoration.** WHEN a job permanently fails, THE Worker SHALL call `releaseReservation()` only after confirming current lease ownership (R6.9). `releaseReservation()` SHALL execute inside a single database transaction: `UPDATE entitlement_reservations SET status = 'released' … WHERE id = ? AND status = 'reserved'`, then — only if that update touched exactly one row AND `kind = 'payg'` — `UPDATE user_usage SET paid_credits = paid_credits + 1 … WHERE user_id = ?` (equivalent to `grant_payg_credits()`). Both writes succeed together or neither does. Credit restoration MUST NOT fire if the reservation was already committed or released.

5. **No release while job is live.** THE Worker SHALL NOT call `releaseReservation()` while the job lease is active. `releaseReservation()` is called only from `failJob()`, and `failJob()` is called only after all chunk retries are exhausted and after lease ownership is confirmed.

6. **Expiry must not touch queued jobs without leases.** THE `expire_abandoned_reservations()` RPC SHALL skip any Reservation whose linked job is in `status IN ('queued', 'processing', 'retrying', 'validating', 'uncertain')`, regardless of whether that job currently holds an active lease. A `queued` job between dispatch and lease acquisition has no lease yet; expiring its reservation would silently cancel it. The guard is on job status, not on lease presence.

7. **Expired PAYG reservation restores credit atomically.** WHEN `expire_abandoned_reservations()` expires a Reservation with `kind = 'payg'`, it SHALL restore the credit inside the same database transaction that sets the Reservation to `expired`, before the function returns.

8. **Retry reuses existing reservation.** WHEN a retry request arrives for a job in `status = 'failed'`, the Convert_API treats it as a new submission for that same job. The job's `reservation_id` already points to the existing Reservation. If that Reservation is still `reserved`, no new credit is consumed and the API proceeds. If the Reservation was `released` (credit restored on failure), the Convert_API MUST call the `authorize_extraction` RPC again for PAYG (re-consuming a credit and inserting a new Reservation) and update `conversion_jobs.reservation_id`; for trial, re-insert a trial Reservation inside a transaction (allowed because the prior one is `released`, satisfying the unique partial index).

9. **Idempotent payment application.** THE Server SHALL apply each payment's entitlement at most once. The gate is `entitlements_applied_at IS NOT NULL`, checked inside `apply_verified_payment()` with `SELECT … FOR UPDATE` locking inside a database transaction. Both the direct verify path and the webhook path use the same RPC.

10. THE Server SHALL prevent concurrent extraction authorizations for the same Identity from creating more than one active trial Reservation, enforced by the `idx_entitlement_one_active_trial` unique partial index on `entitlement_reservations`.

---

### Requirement 10: Rate Limiting and Abuse Prevention

**User Story:** As a system operator, I want consistent, server-enforced rate limits across all processing paths, so that individual users and abusive IPs cannot exhaust shared resources.

#### Acceptance Criteria

1. `allowRate()` in `src/lib/rateLimit.ts` (which calls the `hit_rate_limit` RPC on `rate_limit_buckets`) SHALL be the single enforcement point for all rate limits. The limit values are defined as configurable constants in `LIMITS` within `src/lib/rateLimit.ts`.
2. THE Extraction_Authorization_API SHALL enforce all three limits before creating any reservation: IP-based (`LIMITS.ipAuthorizeHour`), guest Identity (`LIMITS.guestAuthorizeHour`), and user Identity (`LIMITS.userAuthorizeHour`).
3. THE Convert_API SHALL enforce `LIMITS.convertHour` per Identity.
4. **Gemini rate limiting covers every actual call, including retries. Rate-limit waits do not consume chunk attempt counts.** BEFORE every individual Gemini API call — including retry attempts on a chunk — THE Worker SHALL call `allowRate("gemini:global:minute", LIMITS.geminiPerMinute.window, LIMITS.geminiPerMinute.max)`. If this check fails, the Worker SHALL NOT call Gemini and SHALL NOT increment `job_chunks.attempt_count`. Instead it SHALL: set the job to `status = 'retrying'` with `retry_after = now() + LIMITS.geminiPerMinute.window`; release the lease; insert a `job_outbox` row for redispatch at `retry_after`; and return. Because no Gemini attempt was made, no `gemini_attempts` row is inserted for this rate-limit wait. This check MUST happen inside the per-chunk loop. A separate token-budget check SHALL also be performed: if the Worker estimates the chunk's character count would produce a Gemini request exceeding a configurable per-request token ceiling (default: 32,000 input tokens), the Worker SHALL split that chunk in memory before calling Gemini, without persisting a new chunk row.
5. THE System SHALL enforce a maximum of `LIMITS.concurrentJobs` (currently 2) active jobs per Identity, checked in the Extraction_Authorization_API before reservation creation.
6. WHEN any rate limit is exceeded, THE Server SHALL return HTTP 429 with `{ ok: false, code: "too_many", retryAfterSec: N }` where N is a server-computed wait time.
7. THE rate limit state SHALL be stored in Supabase (`rate_limit_buckets`) so it is shared across all Vercel serverless instances and Worker instances.
8. THE Browser SHALL honor `retryAfterSec` from rate-limit responses and SHALL disable retry buttons until the countdown expires.
9. THE Worker SHALL apply exponential backoff with jitter on chunk retries: `delay = min(60s, 4s × 2^attemptCount) + random(0, delay × 0.4)`, as implemented in the `jitter()` function in `src/lib/workerProcess.ts`.
10. IF the `reserve_guest_trial()` RPC (migration 007) detects more than 5 active, non-expired, non-trial-used guest sessions for the same `(ip_hash, user_agent_hash)` combination, it returns NULL, and THE Extraction_Authorization_API SHALL respond with HTTP 429 and `{ ok: false, code: "too_many" }`. This is layered abuse prevention; it does not identify individuals.

---

### Requirement 11: Transaction Validation and Uncertainty Flagging

**User Story:** As a user, I want the system to flag uncertain or inconsistent financial values rather than silently produce incorrect data, so that I can trust what I download.

#### Acceptance Criteria

1. WHEN a Gemini response is received, THE Worker SHALL parse the JSON and validate that `transactions` is an array of objects. If parsing fails or the result is not an array, it SHALL complete the attempt with `status = 'invalid_json'` and throw to trigger the retry path.
2. **Source-aware overlap deduplication.** THE Worker SHALL deduplicate transactions at chunk boundaries using `mergeChunkTransactions()` from `src/lib/chunking.ts`. Deduplication applies only to rows that fall within the overlap window between adjacent chunks — specifically, rows from `parts[i]` whose key matches a row in the trailing overlap of `parts[i-1]`. Rows appearing multiple times within a single chunk are NOT deduplicated; they are treated as legitimate repeats in the source statement. The deduplication key is `date|description.slice(0,80)|debit|credit` computed on the numeric values as extracted, before locale formatting.
3. **Decimal-precision balance validation.** THE Worker SHALL validate balance consistency in `validateTransactions()` using the raw numeric values returned by Gemini, before any locale formatting is applied. The validation rule is: for consecutive rows where both `balance` values are present and non-null, compute `expected = prevBalance + credit − debit`. If `|expected − currentBalance| > tolerance` the row is marked `uncertain = true`. The `tolerance` is NOT a fixed constant like 1.05. Instead: (a) the Worker SHALL detect the likely decimal precision of the statement by inspecting the fractional digits of the amounts Gemini returned (e.g. most INR amounts have 2 decimal places, many JPY amounts have 0); (b) `tolerance` SHALL be set to `0.5 × 10^(−precision)` — for 2-decimal-place currencies this is 0.005, for 0-decimal currencies this is 0.5; (c) if precision cannot be determined from the data, the Worker SHALL fall back to `tolerance = 0.01` and record a `validation_notice` "Balance precision could not be determined; check highlighted rows." This approach flags genuine discrepancies while tolerating only true rounding at the detected precision, not arbitrary ±1.05 gaps.
4. WHEN a transaction row has both a non-zero `debit` and a non-zero `credit`, THE Worker SHALL mark it `uncertain = true` and include the notice "A row has both debit and credit; left unchanged."
5. WHEN any row is missing a `date` field, THE Worker SHALL include the notice "Some rows are missing dates." This notice SHALL be de-duplicated before storing in `validation_notices`.
6. WHEN a completed job has non-empty `validationNotices`, THE Browser SHALL display these notices alongside the transaction preview and Download button.
7. THE Gemini prompt in `parseStatementChunk()` SHALL instruct the model to extract amounts as written without rounding, decimal shifting, or invention, and to set `uncertain = true` on any row it cannot fully parse.

---

### Requirement 12: /app UI Flow

**User Story:** As a user, I want a clear, guided flow from file selection through extraction preview to conversion and download, with meaningful progress and no duplicate submissions.

#### Acceptance Criteria

1. THE App_Page (`/app`) SHALL display a file picker / drop zone with guidance: accepted formats (PDF, images) and maximum size (100 pages / 50 MB suggested).
2. WHEN a file is selected, THE App SHALL show the filename, file size, a "Remove" button, and an "Extract" button. It SHALL NOT start any server call or PDF processing automatically.
3. WHEN the user clicks "Extract", THE Browser SHALL call `/api/extract/authorize` first. Only on `{ ok: true }` SHALL the browser begin local PDF processing, and only for pages 1 through `maxPages`.
4. THE App_Page SHALL show meaningful progress during extraction: page-by-page count for text (e.g., "Reading page 3 of 3"), and per-page OCR progress for scanned files.
5. WHEN extraction completes, THE App SHALL show a compact extracted content preview and change the "Extract" button to "Convert".
6. WHEN the user clicks "Convert", THE App SHALL POST to `/api/convert` with the extracted text and `conversionId`, then navigate to `/preview/{jobId}`.
7. THE Preview_Page SHALL poll `GET /api/jobs/{id}` and display human-readable labels: "In queue", "Processing", "Retrying — we're working on it", "Validating", "Ready", or "Something went wrong".
8. THE Preview_Page SHALL display real progress using `chunksDone / chunksTotal` and SHALL NOT display invented progress percentages.
9. WHEN a job is `ready`, THE Preview_Page SHALL show the transaction data in a spreadsheet preview and offer Export buttons (XLSX, CSV).
10. THE Export_API SHALL verify the caller's Identity owns the referenced `conversion_jobs` row before serving any data; cross-owner attempts SHALL be rejected with HTTP 403. Guest export (without a Supabase session) SHALL be rejected with HTTP 401.
11. WHEN the browser navigates away and returns to `/preview/{jobId}`, THE App SHALL restore the result from the server without re-running Gemini.
12. THE App_Page SHALL disable the "Extract" and "Convert" buttons while the respective operation is in-flight to prevent duplicate submissions.
13. WHEN `GET /api/session` returns `trialFinished = true` and the user has no paid entitlement, THE App SHALL display "Your free trial is finished — upgrade to continue." and SHALL NOT offer the Extract flow.
14. THE App_Page SHALL show a message "Refresh before converting? You may need to select your PDF again." if the page is reloaded between the extract and convert steps, since the extracted text is held in browser memory only.

---

### Requirement 13: Error Messages and Retry UX

**User Story:** As a user, I want error messages that are short, non-technical, and actionable, so that I know what to do without seeing internal diagnostics.

#### Acceptance Criteria

1. THE Server SHALL never return raw stack traces, provider error bodies, Supabase error codes, or Gemini response text in any API response accessible to the browser.
2. THE `customerMessage()` function in `src/lib/customerErrors.ts` SHALL be the single source of all user-facing error strings returned by server APIs.
3. WHEN a job fails, THE App SHALL display the job's `support_ref` with the message "Something went wrong. Reference: {support_ref}" and offer a "Retry conversion" button.
4. THE Admin_Dashboard SHALL store full diagnostics in `last_error_internal` on `conversion_jobs` and in `gemini_attempts` records, linked to `support_ref`. These SHALL be visible only to Admin_Users.
5. WHEN a `retryAfterSec` value is returned, THE App SHALL display a countdown timer and disable the Retry button until the countdown expires.
6. THE App SHALL offer contextually appropriate recovery actions: "Retry extraction" for local extraction failures; "Choose another PDF" for corrupt or unreadable files; "Enter password" for encrypted PDFs; "Retry conversion" for recoverable server-side job failures.
7. WHEN a job is in `uncertain` state, THE App SHALL show "Checking progress…" and continue polling rather than offering a Retry button.
8. THE App SHALL NOT show aggressive upgrade prompts, raw error codes, or debug toasts during failure states. Credit restoration messages SHALL only appear after `releaseReservation()` has confirmed the restoration succeeded.

---

### Requirement 14: Secure Admin Dashboard

**User Story:** As an admin, I want a secure dashboard with server-verified authentication and complete operational visibility, so that I can monitor usage, diagnose issues, and perform safe administrative actions.

#### Acceptance Criteria

1. THE Admin_Dashboard page (`/admin`) SHALL authenticate using Supabase email/password. Every admin API call SHALL be gated by `requireAdminUser()` from `src/lib/identity.ts`, which checks both JWT validity and membership in the `admin_users` table. There SHALL be no hardcoded or shared frontend passwords.
2. THE Admin_Stats_API (`GET /api/admin/stats`) SHALL use `requireAdminUser()` and return HTTP 403 for valid but non-admin users.
3. WHERE `ADMIN_REQUIRE_AAL2 = 'true'` is set, THE Admin_API SHALL require the JWT to have `aal = 'aal2'` (MFA-verified) and SHALL return HTTP 401 with `{ error: "Multi-factor authentication is required for admin access." }` if not, as already implemented in `requireAdminUser()`.
4. THE Admin_Dashboard page SHALL include `<meta name="robots" content="noindex">` and the response SHALL include `X-Robots-Tag: noindex`. Noindex is defense-in-depth only and does not replace authentication.
5. THE Admin_Dashboard SHALL display: Overview (total users, successful conversions counted from `conversion_jobs WHERE status = 'ready'`, estimated AI cost from `gemini_attempts.estimated_cost_usd`), Customers (per-user stats), Conversions (job list with status, `support_ref`, owner), Gemini Calls (`gemini_attempts` with token counts and costs), Payments (payment history), System Health (outbox queue depth, rate limit hits, recent errors), and Audit History (`admin_audit` log).
6. THE Admin_Stats_API SHALL compute `totalConversions` by counting `conversion_jobs WHERE status = 'ready'`, not by summing `user_usage.conversions_used`. Historical conversions recorded only in `user_usage` (before `conversion_jobs` existed) SHALL be surfaced as a separate labeled series ("Legacy conversions: N") rather than merged into the main count or fabricated.
7. THE Admin_Dashboard SHALL distinguish between conversion attempts (all `conversion_jobs` rows) and successful conversions (`status = 'ready'`).
8. THE Admin_Audit table (`admin_audit`) SHALL receive a row via `writeAdminAudit()` for every sensitive admin action: promote/demote admin, manual entitlement change, job retry override. The row SHALL include `actor_id`, `action`, `target_type`, `target_id`, `reason`, and `metadata`.
9. WHEN an admin triggers a retry on a failed job, THE Admin_Dashboard SHALL POST to `/api/jobs/{id}/retry` rather than directly updating database rows.
10. THE Admin_Dashboard SHALL redact or hide `extracted_text`, `result_json`, and `gemini_attempts` response text by default, showing only metadata fields unless the admin explicitly expands a row.

---

### Requirement 15: Signup Attribution and Other-Field Handling

**User Story:** As a marketing operator, I want complete attribution data captured from first touch through signup and payment, so that I can measure acquisition channel effectiveness.

#### Acceptance Criteria

1. `POST /api/session` SHALL call `sanitizeAttribution()` from `src/lib/attribution.ts` to produce a `TouchAttribution` snapshot containing: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`, `landing_url`, `signup_url`, `signup_path`, `acquisition_country` (from `x-vercel-ip-country` header), and `captured_at`.
2. `POST /api/session` SHALL store `first_touch` in `guest_attribution` or `user_attribution` only if it does not already exist; it SHALL always update `last_touch`, preserving first-touch attribution across navigation and login redirects.
3. `sanitizeUrl()` SHALL strip: (a) sensitive query parameters matching the regex in `src/lib/attribution.ts` (`token`, `access_token`, `refresh_token`, `password`, `code`, `auth`, `key`, `secret`, `session`), and (b) URL fragments (`#...`).
4. WHEN a UTM source is absent and no referrer is present, THE Attribution_Module SHALL record `utm_source = null`, not a guessed or default string.
5. THE Affiliate_Lead_API (`POST /api/affiliate/lead`) SHALL be called after user signup with the user's Bearer token and the `affitor_click_id` cookie value to register the lead with Affitor. The existing affiliate integration SHALL be preserved unchanged.
6. THE Payment_CreateOrder_API SHALL read the `affitor_click_id` cookie, validate it, and store it in the `payments` row and in the Razorpay order notes before creating the order.
7. **Acquisition source and profession are stored in separate columns.** The signup form currently uses a single `user_usage.profession` column (added in migration 004) for a field whose purpose is ambiguous — it may record acquisition source ("How did you hear about us?"), profession, or both. The implementation SHALL treat them as two distinct concerns stored in two distinct columns:
   - `user_usage.profession`: stores the user's profession or role (e.g., "Accountant", "Business Owner"). This field MAY remain optional.
   - `user_usage.acquisition_source`: a new column (to be added in migration 009 if absent) that stores the selected acquisition channel (e.g., "Google Search", "Friend referral", "Others"). Migration 009 SHALL backfill `acquisition_source` from `profession` for existing rows only if the existing value matches a known acquisition-source option; otherwise it leaves `acquisition_source` NULL.
   - `user_usage.profession_detail`: stores the free-text "Please specify" answer when `acquisition_source = 'Others'` (or `profession = 'Others'` in existing rows).

   WHEN the acquisition-source form field has a selected value of "Other" or "Others", THE App SHALL display a required text input "Please specify". THE Server SHALL validate it is non-empty and persist it in `user_usage.profession_detail`. `profession_detail` MUST NOT overwrite `profession` or `acquisition_source`. These three columns are independent.
8. WHEN a guest signs up, `link_guest_session_to_user()` SHALL transfer attribution from `guest_attribution` to `user_attribution` and link `guest_session_id` on `user_attribution`.
9. THE Attribution system SHALL keep `acquisition_country` (IP-derived at signup time) distinct from any billing country in `payments`.

---

### Requirement 16: Data Protection and Retention

**User Story:** As a system operator, I want submitted text purged on schedule and result data retained for authorized repeat downloads, so that user data is protected and the service remains usable after the initial conversion.

#### Acceptance Criteria

1. THE Convert_API SHALL set `extracted_text_expires_at` to 2 hours after job creation on the `conversion_jobs` row. The 2-hour window is a configurable constant, not a hardcoded literal.
2. WHEN a job completes (`status = 'ready'`), THE Worker SHALL set `extracted_text = NULL` on the `conversion_jobs` row immediately after writing `result_json`, before returning from `processJob()`.
3. **Retention must not purge data needed by active or retryable jobs.** THE `purge_expired_job_payloads()` RPC SHALL purge `conversion_jobs.extracted_text` only when `extracted_text_expires_at < now()` AND the job's `status` is NOT in `('queued', 'processing', 'retrying', 'validating', 'uncertain')`. For jobs still in-flight, the RPC SHALL skip purging `extracted_text` even if the timestamp has passed. `job_chunks.input_text` SHALL be set to `NULL` only when the corresponding job's `extracted_text` has been purged (either by completion or by the RPC). `job_chunks.output_json` SHALL NOT be purged until `result_expires_at` has passed (see criterion 5).
4. THE System SHALL retain `result_json` on `conversion_jobs` and `output_json` on all linked `job_chunks` until `result_expires_at` (90 days after job completion, configurable). Both copies are needed: `result_json` serves the export API; `output_json` on chunks serves admin diagnostics.
5. WHEN `result_expires_at < now()` for a completed job, THE `purge_expired_job_payloads()` RPC SHALL set `result_json = NULL` and `edited_result_json = NULL` on the `conversion_jobs` row, AND set `output_json = NULL` on all linked `job_chunks` rows in the same operation.
6. THE Export_API SHALL serve authorized downloads for any `ready` job within the `result_expires_at` window without re-running Gemini.
7. THE `supabaseAdmin` client (service role key) SHALL only be imported in files guarded by `import "server-only"`. It SHALL never appear in browser bundles or `NEXT_PUBLIC_` environment variables.
8. THE `conversion_jobs.result_json`, `job_chunks.output_json`, and `job_chunks.input_text` columns SHALL only be accessible server-side via `service_role`. RLS policies use `USING (false)` for `anon` and `authenticated` roles on these tables.

---

### Requirement 17: Legacy and Bypass Route Protection

**User Story:** As a system operator, I want all processing routes to use the same authorization service, so that no legacy or undocumented endpoint can bypass entitlement checks.

#### Acceptance Criteria

1. THE `/api/parse-bank-statement` route SHALL be deprecated. Any request to it SHALL return HTTP 410 with a message directing the caller to the new flow. Existing clients SHALL be migrated to the `/api/extract/authorize` → `/api/convert` → `/api/jobs/{id}` flow.
2. THE `/api/ocr/parse` route SHALL require a valid Identity resolved by `resolveIdentity()` and SHALL check entitlement via `loadEntitlement()` before processing. Unauthenticated and unauthorized requests SHALL be rejected with HTTP 401 or 402.
3. THE `/api/usage/consume` route SHALL continue to return HTTP 410. Entitlement consumption is handled exclusively through `entitlement_reservations`.
4. THE `/api/usage/increment` route SHALL require a valid Supabase Bearer token (authenticated user). The `app/page.tsx` code currently calls this after a successful conversion; this call SHALL be replaced by the Worker's `commitReservation()` path, which already calls `increment_conversions_used()`. The route SHALL be audited and either removed or restricted to service-role-only use.
5. THE `/api/export` route SHALL verify Identity ownership of the referenced conversion via `assertJobOwner()` before serving any data. It SHALL reject guest requests (no Supabase session) with HTTP 401.
6. ALL routes under `/api/admin/` SHALL call `requireAdminUser()` on every request.
7. THE Next.js middleware (`src/middleware.ts`) SHALL add `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` to all API responses.

---

### Requirement 18: Supabase Schema Non-Destructive Migration

**User Story:** As a database operator, I want any schema changes to be non-destructive, grounded in the actual applied migrations, and resolve the current file conflict, so that customer records are never lost.

#### Acceptance Criteria

1. **Inspect before migrating.** BEFORE writing any migration 009, the implementer SHALL query the live Supabase instance to determine which tables, columns, functions, and indexes currently exist. The result of that inspection SHALL be documented in the migration header. No assumption about which 008 file was applied shall be made without this check.
2. ALL `CREATE TABLE` statements SHALL use `IF NOT EXISTS`. ALL `ALTER TABLE ADD COLUMN` statements SHALL use `IF NOT EXISTS`. ALL `CREATE INDEX`, `CREATE UNIQUE INDEX`, and `CREATE POLICY` statements SHALL use `IF NOT EXISTS` or `DROP POLICY IF EXISTS` before `CREATE POLICY`. `CREATE OR REPLACE FUNCTION` is acceptable for functions.
3. THE conflicting `008_jobs_reservations_accounting.sql` file SHALL be renamed to `008_jobs_reservations_accounting.sql.skip` to prevent accidental application. It SHALL NOT be deleted until after live schema inspection confirms which file was actually applied. If inspection shows `usage_reservations` exists but `entitlement_reservations` does not, migration 009 SHALL add `entitlement_reservations` rather than assuming the ledger file ran.
4. THE Migration_Scripts SHALL never `DROP TABLE`, `TRUNCATE`, or `DELETE FROM` any table containing customer data (`payments`, `user_usage`, `conversion_jobs`, `guest_sessions`, `gemini_attempts`, `conversions`).
5. WHEN a migration adds a `CHECK` constraint to an existing table with existing rows, it SHALL be added as `NOT VALID` first, then `VALIDATE CONSTRAINT` separately in a subsequent step.
6. EACH new migration file SHALL include a header comment specifying: prerequisite migration numbers, which live tables were confirmed present, rollback steps, and any backfill requirements.
7. **RLS policy audit required.** Migration 002 created a permissive `"Users can update own usage"` policy that allows authenticated users to write any column on `user_usage`. Migration 006 replaced it with a more restrictive policy, but only if both ran. Migration 009 SHALL include `DROP POLICY IF EXISTS "Users can update own usage" ON user_usage` followed by the restrictive policy from 008 ledger, to ensure the permissive policy is removed even in environments where 006 did not apply cleanly. The same audit SHALL be done for the `payments` insert policy.
8. REVOKE/GRANT statements on SECURITY DEFINER functions SHALL follow the pattern in `008_jobs_ledger_attribution.sql`: `REVOKE ALL … FROM PUBLIC; GRANT EXECUTE … TO service_role;`. New functions added in migration 009 SHALL follow the same pattern.
9. **`token_usage` has generated columns.** Migration 003 defines `total_tokens`, `estimated_input_cost_usd`, `estimated_output_cost_usd`, and `estimated_total_cost_usd` as `GENERATED ALWAYS AS … STORED` columns using OpenAI pricing. These columns cannot be inserted into directly and their formulas cannot be changed with a simple `ALTER COLUMN`. Any migration 009 that needs different pricing on `token_usage` SHALL add new nullable columns rather than altering generated ones. The `gemini_attempts` table (migration 008) is the authoritative source for Gemini cost accounting; `token_usage` is the legacy OpenAI table and SHALL be left unchanged.

---

### Requirement 19: End-to-End Verification Scenarios

**User Story:** As a QA engineer, I want a defined set of scenarios to verify the complete system, so that every critical path is tested before deployment.

#### Acceptance Criteria

1. **Guest trial → signup, no second conversion.** A guest completes the free text trial (3 pages), clicks Download (prompted to sign up), signs up, and downloads — without being granted a second free conversion. `user_usage.conversions_used` SHALL equal 1 after signup, confirmed by querying the row directly.
2. **OCR trial → signup.** A guest completes the free OCR trial (1 page), signs up, and verifies `user_usage.conversions_used = 1` immediately after `link_guest_session_to_user()` runs in the auth callback.
3. **Guest signup into already-used account.** A guest whose `trial_used = true` attempts to link their guest session to a user account that already has `conversions_used >= 1`. The `link_guest_session_to_user()` function SHALL not reduce `conversions_used` and SHALL not grant a free conversion; the user account's state is preserved.
4. **Cross-owner rejection.** A `POST /api/convert` call with a `conversionId` belonging to a different Identity SHALL be rejected with HTTP 404.
5. **Duplicate convert.** Two `POST /api/convert` calls for the same `conversionId` within seconds: the second SHALL return `{ ok: true, jobId, already: true, status }` without creating duplicate `job_chunks`.
6. **Simultaneous authorize.** Two simultaneous `POST /api/extract/authorize` calls from the same guest session: exactly one SHALL succeed and create a reservation; the other SHALL reuse it or receive a conflict error from the unique partial index.
7. **Payment idempotency.** A Razorpay payment verify call followed by a duplicate webhook event: `apply_verified_payment()` SHALL return `'already_applied'`. The gate is `entitlements_applied_at IS NOT NULL`, not `payment_status = 'paid'`.
8. **Worker crash recovery.** A simulated worker crash mid-chunk: the next worker invocation (triggered by stale-lease recovery in the outbox drain) SHALL skip completed chunks, retry only incomplete ones, and eventually complete the job.
9. **Large statement.** A ~400,000-char statement split into multiple chunks SHALL merge without losing or duplicating transactions across chunk boundaries. Overlap rows SHALL be deduplicated once; non-overlap repeats SHALL be preserved.
10. **Repeat download.** An authorized repeat download of a `ready` job within `result_expires_at` SHALL serve the result without re-running Gemini.
11. **Admin totals accuracy.** The Admin_Dashboard `totalConversions` SHALL equal the exact count of `conversion_jobs WHERE status = 'ready'`. Historical `user_usage.conversions_used` sums SHALL be shown as a separate labeled series.
12. **Storage-clear abuse.** A guest who clears browser storage and attempts a new extraction: `resolveIdentity()` issues a new session, but `reserve_guest_trial()` rejects it because the `(ip_hash, ua_hash)` pair already has 5 active non-expired sessions.
13. **Token budget enforcement.** A `POST /api/convert` where submitted text length exceeds the `token_budget` stored on the job row SHALL be rejected with HTTP 400, regardless of the browser-reported page count.
14. **Export requires login.** A guest with only a `ste_gst` cookie (no Supabase session) attempting to export/download SHALL receive HTTP 401 from the Export_API.
15. **Mixed PDF with trial.** A PDF where page 1 is text and page 2 is image-only: the browser starts with `kind = "text"` authorization (maxPages = 3), reads page 1 successfully, detects page 2 is image-only, stops, calls `/api/extract/authorize` again with `kind = "ocr"` (which returns maxPages = 1 for a trial user), and OCRs only page 1. The total pages processed does not silently exceed the trial limit.
16. **Uncertain state recovery.** A job set to `uncertain` due to an open Gemini attempt SHALL be automatically transitioned back to `retrying` by the outbox drain after the configurable timeout (default 120 seconds), without requiring manual intervention.
