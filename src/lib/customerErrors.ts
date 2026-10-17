export const CUSTOMER_MESSAGES = {
  pdf_unreadable: "Couldn’t read this PDF.",
  server_busy: "Server busy. Retrying shortly…",
  queued: "Your conversion is queued.",
  too_many: "Too many attempts. Retry in 30s.",
  convert_failed: "Couldn’t finish this conversion.",
  trial_complete: "Free trial complete.",
  save_progress: "Save your progress with a free account.",
  credit_restored: "Your credit was restored.",
  provider_outage: "Our converter is temporarily unavailable. Your payment is unchanged.",
  trial_upgrade: "Your free trial is finished — upgrade to continue.",
  sign_in_download: "Sign in to download your converted file.",
  mixed_trial: "Free trial extracts text from pages 1–3 only. Scanned pages in that range are skipped. Scanned-page trial OCRs page 1 only.",
  refresh_warning: "Refreshing before Convert may require selecting the PDF again.",
} as const;

export type CustomerErrorCode = keyof typeof CUSTOMER_MESSAGES;

export function customerMessage(code: CustomerErrorCode | string | null | undefined): string {
  if (code && code in CUSTOMER_MESSAGES) {
    return CUSTOMER_MESSAGES[code as CustomerErrorCode];
  }
  return "Something went wrong. Please try again.";
}
