export const VERTEX_MODEL = "gemini-2.5-flash-lite";
export const VERTEX_LOCATION = "global";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_PAGES_TECHNICAL = 100;
export const TRIAL_TEXT_PAGES = 3;
export const TRIAL_OCR_PAGES = 1;
export const MAX_SUBMITTED_CHARS = 400_000;
export const CHUNK_CHAR_BUDGET = 24_000;
export const CHUNK_OVERLAP_CHARS = 400;
export const SOURCE_TEXT_RETENTION_HOURS = 24;
export const RESULT_RETENTION_DAYS = 30;
export const RESERVATION_TTL_HOURS = 2;
export const EXTRACT_FAIL_BUDGET = 5;
export const JOB_RETRY_BUDGET = 4;
export const WORKER_LEASE_SECONDS = 90;
export const CHUNK_PROVIDER_TIMEOUT_MS = 55_000;

export const CUSTOMER_ERRORS = {
  couldnt_read_pdf: "Couldn’t read this PDF.",
  server_busy: "Server busy. Retrying shortly…",
  queued: "Your conversion is queued.",
  too_many_attempts: "Too many attempts. Retry in 30s.",
  couldnt_finish: "Couldn’t finish this conversion.",
  trial_complete: "Free trial complete.",
  save_progress: "Save your progress with a free account.",
  credit_restored: "Your credit was restored.",
  signup_to_download: "Sign in to download your file.",
  upgrade_to_continue: "Your free trial is finished — upgrade to continue.",
  choose_another: "Choose another PDF.",
  password_needed: "This PDF is password protected.",
} as const;

export type CustomerErrorCode = keyof typeof CUSTOMER_ERRORS;
