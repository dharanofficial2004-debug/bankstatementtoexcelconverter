import "server-only";
import { supabaseAdmin } from "./supabaseServer";

export interface UserSubscription {
  id: string;
  user_id: string;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  status: string;
  current_start: string | null;
  current_end: string | null;
  cancel_at_cycle_end: boolean;
}

export async function getLatestUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("user_subscriptions")
    .select("id, user_id, razorpay_subscription_id, razorpay_plan_id, status, current_start, current_end, cancel_at_cycle_end")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[subscriptions] Failed to load user subscription:", error.message);
    return null;
  }

  return data;
}

export function getMonthlyPlanStatus(
  subscription: UserSubscription | null,
  now = Date.now()
): "monthly" | "monthly_pending" | null {
  if (!subscription) return null;

  const currentEnd = subscription.current_end
    ? Date.parse(subscription.current_end)
    : Number.NaN;
  const periodIsActive = Number.isFinite(currentEnd) && currentEnd > now;

  if (
    periodIsActive &&
    ["active", "pending", "halted", "paused", "resumed"].includes(subscription.status)
  ) {
    return "monthly";
  }

  if (
    ["created", "authenticated", "active", "pending", "halted", "paused", "resumed"].includes(
      subscription.status
    )
  ) {
    return "monthly_pending";
  }

  return null;
}
