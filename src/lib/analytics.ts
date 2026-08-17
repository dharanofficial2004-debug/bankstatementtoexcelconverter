/**
 * Analytics helpers — GA4 via gtag() only. No GTM.
 *
 * GA4 measurement ID: G-D1BQKKX3CJ (from layout.tsx)
 *
 * All helpers are no-ops when:
 *  - window.gtag is not available (SSR or ad-blocked)
 *  - called from server-side code
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// ─── Internal safe caller ──────────────────────────────────────────────────────

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag(...args);
}

// ─── Traffic source detection ─────────────────────────────────────────────────

/**
 * Detect which traffic source referred this visit.
 * Stored in sessionStorage so it persists through the funnel.
 */
export function detectTrafficSource(): string {
  if (typeof window === "undefined") return "direct";

  const stored = sessionStorage.getItem("traffic_source");
  if (stored) return stored;

  const ref = document.referrer.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source")?.toLowerCase() ?? "";
  const utmMedium = params.get("utm_medium")?.toLowerCase() ?? "";

  let source = "direct";

  if (utmSource) {
    // Honour explicit UTM tags first
    if (utmMedium === "cpc" || utmMedium === "paid") source = "paid_search";
    else if (utmSource === "youtube" || utmMedium === "video") source = "youtube";
    else if (["facebook", "instagram", "twitter", "linkedin", "pinterest", "tiktok"].includes(utmSource)) source = "social";
    else if (utmMedium === "email") source = "email";
    else source = `utm_${utmSource}`;
  } else if (ref) {
    if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\./.test(ref)) source = "organic_search";
    else if (/youtube\.com/.test(ref)) source = "youtube";
    else if (/facebook\.|instagram\.|twitter\.|t\.co|linkedin\.|pinterest\.|tiktok\./.test(ref)) source = "social";
    else if (/chatgpt\.|perplexity\.|gemini\.|claude\.|copilot\.|you\.com|phind\./.test(ref)) source = "ai_tools";
    else source = "referral";
  }

  sessionStorage.setItem("traffic_source", source);
  return source;
}

// ─── Funnel: Upload ───────────────────────────────────────────────────────────

/** Fired when user drops or selects a PDF file */
export function trackUploadPdf(params?: { bank?: string; file_name?: string }) {
  gtag("event", "upload_pdf", {
    event_category: "funnel",
    traffic_source: detectTrafficSource(),
    bank_detected: params?.bank ?? "unknown",
    file_name: params?.file_name ?? "unknown",
  });
}

// ─── Funnel: Conversion ───────────────────────────────────────────────────────

/** Fired when the AI parsing API call starts */
export function trackConversionStarted(params?: { bank?: string; pages?: number }) {
  gtag("event", "conversion_started", {
    event_category: "funnel",
    traffic_source: detectTrafficSource(),
    bank_detected: params?.bank ?? "unknown",
    pages: params?.pages ?? 0,
  });
}

// ─── Funnel: Preview ─────────────────────────────────────────────────────────

/** Fired when the spreadsheet preview becomes visible */
export function trackPreviewDisplayed(params?: {
  bank?: string;
  transaction_count?: number;
}) {
  gtag("event", "preview_displayed", {
    event_category: "funnel",
    traffic_source: detectTrafficSource(),
    bank_detected: params?.bank ?? "unknown",
    transaction_count: params?.transaction_count ?? 0,
  });
}

// ─── Funnel: Auth ─────────────────────────────────────────────────────────────

/** Fired when the login/signup modal opens */
export function trackSignupStarted(params?: { trigger?: string }) {
  gtag("event", "signup_started", {
    event_category: "auth",
    traffic_source: detectTrafficSource(),
    trigger: params?.trigger ?? "manual",
  });
}

/** Fired after a new user completes email OTP signup */
export function trackSignupCompleted(params?: { method?: string }) {
  gtag("event", "signup_completed", {
    event_category: "auth",
    traffic_source: detectTrafficSource(),
    method: params?.method ?? "email",
  });
}

/** Fired after an existing user logs in successfully */
export function trackLoginCompleted(params?: { method?: string }) {
  gtag("event", "login_completed", {
    event_category: "auth",
    traffic_source: detectTrafficSource(),
    method: params?.method ?? "email",
  });
}

// ─── Funnel: Download ────────────────────────────────────────────────────────

/** Fired when the user clicks any Export button */
export function trackDownloadButtonClicked(params?: { format?: string }) {
  gtag("event", "download_button_clicked", {
    event_category: "funnel",
    traffic_source: detectTrafficSource(),
    format: params?.format ?? "unknown",
  });
}

/** Fired after a successful Excel (.xlsx) download */
export function trackDownloadExcel(params?: { bank?: string; transaction_count?: number }) {
  gtag("event", "download_excel", {
    event_category: "download",
    traffic_source: detectTrafficSource(),
    bank_detected: params?.bank ?? "unknown",
    transaction_count: params?.transaction_count ?? 0,
  });
}

/** Fired after a successful CSV download */
export function trackDownloadCsv(params?: { bank?: string; transaction_count?: number }) {
  gtag("event", "download_csv", {
    event_category: "download",
    traffic_source: detectTrafficSource(),
    bank_detected: params?.bank ?? "unknown",
    transaction_count: params?.transaction_count ?? 0,
  });
}

// ─── Funnel: Payment ─────────────────────────────────────────────────────────

/** Fired when the plan/pricing modal opens */
export function trackPaymentPageViewed(params?: { plan?: string }) {
  gtag("event", "payment_page_viewed", {
    event_category: "payment",
    traffic_source: detectTrafficSource(),
    plan: params?.plan ?? "unknown",
  });
}

/** Fired when Razorpay is opened (order created successfully) */
export function trackPaymentInitiated(params: {
  plan: string;
  value: number;
  currency?: string;
}) {
  gtag("event", "payment_initiated", {
    event_category: "payment",
    traffic_source: detectTrafficSource(),
    plan: params.plan,
    value: params.value,
    currency: params.currency ?? "INR",
  });

  // GA4 ecommerce begin_checkout
  gtag("event", "begin_checkout", {
    currency: params.currency ?? "INR",
    value: params.value,
    items: [{ item_id: params.plan, item_name: params.plan, price: params.value, quantity: 1 }],
  });
}

/** Fired after payment verification succeeds on the server */
export function trackPaymentSuccess(params: {
  plan: string;
  value: number;
  currency?: string;
  transaction_id?: string;
}) {
  gtag("event", "payment_success", {
    event_category: "payment",
    traffic_source: detectTrafficSource(),
    plan: params.plan,
    value: params.value,
    currency: params.currency ?? "INR",
    transaction_id: params.transaction_id ?? "",
  });

  // GA4 ecommerce purchase — shows in Revenue reports
  gtag("event", "purchase", {
    transaction_id: params.transaction_id ?? `txn_${Date.now()}`,
    value: params.value,
    currency: params.currency ?? "INR",
    items: [{ item_id: params.plan, item_name: params.plan, price: params.value, quantity: 1 }],
  });
}

/** Fired when Razorpay reports a payment failure */
export function trackPaymentFailed(params?: { plan?: string; reason?: string }) {
  gtag("event", "payment_failed", {
    event_category: "payment",
    traffic_source: detectTrafficSource(),
    plan: params?.plan ?? "unknown",
    reason: params?.reason ?? "unknown",
  });
}

// ─── Convenience wrapper ──────────────────────────────────────────────────────

/** Generic escape hatch — use sparingly */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
) {
  gtag("event", name, {
    traffic_source: detectTrafficSource(),
    ...params,
  });
}
