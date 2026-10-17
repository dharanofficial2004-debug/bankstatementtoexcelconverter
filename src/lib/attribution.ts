const SENSITIVE_QUERY = /^(token|access_token|refresh_token|password|code|auth|key|secret|session)$/i;

export interface TouchAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  landing_url: string | null;
  signup_url: string | null;
  signup_path: string | null;
  acquisition_country: string | null;
  captured_at: string;
}

export function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw, "https://bankstatementtoexcelconverter.com");
    if (!/^https?:$/.test(url.protocol)) return null;
    const sensitiveKeys: string[] = [];
    url.searchParams.forEach((_value, key) => {
      if (SENSITIVE_QUERY.test(key)) sensitiveKeys.push(key);
    });
    sensitiveKeys.forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    const href = url.toString();
    return href.slice(0, 2000);
  } catch {
    return null;
  }
}

export function sanitizeAttribution(body: Record<string, unknown>, path: string, country: string | null): TouchAttribution {
  const utm = (key: string) => {
    const v = body[key];
    return typeof v === "string" && v.trim() ? v.trim().slice(0, 200) : null;
  };
  return {
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
    utm_content: utm("utm_content"),
    utm_term: utm("utm_term"),
    referrer: sanitizeUrl(body.referrer),
    landing_url: sanitizeUrl(body.landing_url),
    signup_url: sanitizeUrl(body.signup_url),
    signup_path: path.slice(0, 200),
    acquisition_country: country,
    captured_at: new Date().toISOString(),
  };
}

export function sourceLabel(touch: TouchAttribution): string {
  if (touch.utm_source) return "utm";
  if (touch.referrer) return "referral";
  return "direct";
}

