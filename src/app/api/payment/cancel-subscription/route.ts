import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getRazorpayCredentials } from "@/lib/razorpaySubscriptions";

export const dynamic = "force-dynamic";

interface RazorpayCancelResponse {
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Server configuration missing." }, { status: 503 });
    }

    const auth = await authenticate(request);
    if (!auth.ok) return auth.response;

    const { data: subscription, error: lookupError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("razorpay_subscription_id, status, current_end, cancel_at_cycle_end")
      .eq("user_id", auth.ctx.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("[payment/cancel-subscription] Failed to load subscription:", lookupError.message);
      return NextResponse.json(
        { success: false, error: "Could not load the subscription." },
        { status: 500 }
      );
    }
    if (
      !subscription ||
      !["created", "authenticated", "active", "pending", "halted", "paused", "resumed"].includes(
        subscription.status
      )
    ) {
      return NextResponse.json(
        { success: false, error: "No manageable monthly subscription was found." },
        { status: 404 }
      );
    }
    if (subscription.cancel_at_cycle_end) {
      return NextResponse.json({
        success: true,
        alreadyScheduled: true,
        cancelAtCycleEnd: true,
      });
    }

    const { authorization } = getRazorpayCredentials();
    const currentEnd = subscription.current_end ? Date.parse(subscription.current_end) : Number.NaN;
    const cancelAtCycleEnd =
      Number.isFinite(currentEnd) &&
      currentEnd > Date.now() &&
      ["active", "pending", "halted", "paused", "resumed"].includes(subscription.status);
    const response = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(subscription.razorpay_subscription_id)}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authorization },
        body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd }),
      }
    );

    if (!response.ok) {
      console.error("[payment/cancel-subscription] Razorpay request failed:", response.status);
      return NextResponse.json(
        { success: false, error: "Razorpay could not cancel the subscription. Please try again or contact support." },
        { status: 502 }
      );
    }

    const razorpaySubscription = (await response.json()) as RazorpayCancelResponse;
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        status: razorpaySubscription.status || subscription.status,
        cancel_at_cycle_end: cancelAtCycleEnd,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_subscription_id", subscription.razorpay_subscription_id)
      .eq("user_id", auth.ctx.userId);

    if (updateError) {
      console.error("[payment/cancel-subscription] Failed to record cancellation:", updateError.message);
      return NextResponse.json(
        { success: false, error: "Cancellation was sent, but its status could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, cancelAtCycleEnd });
  } catch (error) {
    console.error("[payment/cancel-subscription] Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while cancelling the subscription." },
      { status: 500 }
    );
  }
}
