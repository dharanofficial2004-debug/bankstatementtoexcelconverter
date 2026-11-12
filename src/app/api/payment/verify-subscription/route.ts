import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseServer";
import {
  fetchRazorpaySubscription,
  getRazorpayCredentials,
  unixTimestampToIso,
  verifyRazorpaySignature,
} from "@/lib/razorpaySubscriptions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = await request.json();

    if (
      typeof paymentId !== "string" ||
      typeof signature !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Missing subscription verification fields." },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Server configuration missing." }, { status: 503 });
    }

    const auth = await authenticate(request);
    if (!auth.ok) return auth.response;

    const { data: row, error: rowError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, razorpay_subscription_id, razorpay_plan_id, cancel_at_cycle_end")
      .eq("user_id", auth.ctx.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (rowError) {
      console.error("[payment/verify-subscription] Failed to load subscription:", rowError.message);
      return NextResponse.json(
        { success: false, error: "Could not verify the subscription." },
        { status: 500 }
      );
    }
    if (!row) {
      return NextResponse.json(
        { success: false, error: "No subscription was found for this account." },
        { status: 404 }
      );
    }

    const monthlyPlanId = process.env.RAZORPAY_MONTHLY_PLAN_ID;
    if (!monthlyPlanId || row.razorpay_plan_id !== monthlyPlanId) {
      return NextResponse.json(
        { success: false, error: "Monthly subscription configuration does not match." },
        { status: 503 }
      );
    }

    const { keySecret, authorization } = getRazorpayCredentials();
    if (!verifyRazorpaySignature(
      `${paymentId}|${row.razorpay_subscription_id}`,
      signature,
      keySecret
    )) {
      return NextResponse.json(
        { success: false, error: "Subscription payment verification failed." },
        { status: 400 }
      );
    }

    const subscriptionId = row.razorpay_subscription_id;
    const subscription = await fetchRazorpaySubscription(subscriptionId, authorization);
    if (subscription.plan_id !== monthlyPlanId) {
      return NextResponse.json(
        { success: false, error: "Subscription plan verification failed." },
        { status: 400 }
      );
    }
    const currentEnd = unixTimestampToIso(subscription.current_end);
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        status: subscription.status,
        current_start: unixTimestampToIso(subscription.current_start),
        current_end: currentEnd,
        cancel_at_cycle_end:
          subscription.has_scheduled_changes ?? row.cancel_at_cycle_end,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_subscription_id", subscriptionId)
      .eq("user_id", auth.ctx.userId);

    if (updateError) {
      console.error("[payment/verify-subscription] Failed to update subscription:", updateError.message);
      return NextResponse.json(
        { success: false, error: "Could not update the subscription status." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      active: subscription.status === "active" && Boolean(currentEnd && Date.parse(currentEnd) > Date.now()),
      subscriptionStatus: subscription.status,
    });
  } catch (error) {
    console.error("[payment/verify-subscription] Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during subscription verification." },
      { status: 500 }
    );
  }
}
