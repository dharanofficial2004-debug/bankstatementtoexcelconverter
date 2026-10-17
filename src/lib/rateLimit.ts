import "server-only";
import { supabaseAdmin } from "./supabaseServer";

export async function allowRate(key: string, windowSeconds: number, max: number): Promise<boolean> {
  if (!supabaseAdmin) return true;
  const { data, error } = await supabaseAdmin.rpc("hit_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max: max,
  });
  if (error) {
    console.error("[rate-limit]", error.message);
    return true;
  }
  return data === true;
}

export const LIMITS = {
  guestAuthorizeHour: { window: 3600, max: 20 },
  userAuthorizeHour: { window: 3600, max: 60 },
  ipAuthorizeHour: { window: 3600, max: 40 },
  convertHour: { window: 3600, max: 30 },
  geminiPerMinute: { window: 60, max: 20 },
  concurrentJobs: 2,
};
