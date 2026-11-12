import { NextRequest, NextResponse } from "next/server";
import { authenticate, getUsage } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getLatestUserSubscription } from "@/lib/subscriptions";
import {
  fetchRazorpayPlan,
  getRazorpayCredentials,
  type RazorpaySubscription,
} from "@/lib/razorpaySubscriptions";
import {
  MONTHLY_PRICE_USD,
  MONTHLY_SUBSCRIPTION_TOTAL_CYCLES,
  priceToSmallestUnit,
} from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Server configuration missing." }, { status: 503 });
    }

    const auth = await authenticate(request);
    if (!auth.ok) return auth.response;

    const monthlyPlanId = process.env.RAZORPAY_MONTHLY_PLAN_ID;
    if (!monthlyPlanId) {
      return NextResponse.json(
        { success: false, error: "Monthly subscriptions are not configured. Please contact support." },
        { status: 503 }
      );
    }

    const existingSubscription = await getLatestUserSubscription(auth.ctx.userId);
    if (
      existingSubscription &&
      existingSubscription.razorpay_plan_id === monthlyPlanId
    ) {
      const currentEnd = existingSubscription.current_end
        ? Date.parse(existingSubscription.current_end)
        : Number.NaN;
      const hasCurrentPeriod = Number.isFinite(currentEnd) && currentEnd > Date.now();
      const canResume =
        existingSubscription.status === "created" ||
        existingSubscription.status === "pending" && !hasCurrentPeriod;
      if (canResume) {
        return NextResponse.json({
          success: true,
          subscriptionId: existingSubscription.razorpay_subscription_id,
          amount: priceToSmallestUnit(MONTHLY_PRICE_USD),
          currency: "USD",
        });
      }
    }

    const usage = await getUsage(auth.ctx.userId);
    if (usage.plan === "lifetime") {
      return NextResponse.json(
        { success: false, error: "Lifetime access already includes unlimited conversions." },
        { status: 409 }
      );
    }
    if (usage.plan === "monthly" || usage.plan === "monthly_pending") {
      return NextResponse.json(
        { success: false, error: "A monthly subscription is already active or awaiting confirmation." },
        { status: 409 }
      );
    }

    const { authorization } = getRazorpayCredentials();
    const razorpayPlan = await fetchRazorpayPlan(monthlyPlanId, authorization);
    if (
      razorpayPlan.id !== monthlyPlanId ||
      razorpayPlan.period !== "monthly" ||
      razorpayPlan.interval !== 1 ||
      razorpayPlan.item.amount !== priceToSmallestUnit(MONTHLY_PRICE_USD) ||
      razorpayPlan.item.currency !== "USD"
    ) {
      console.error("[payment/create-subscription] Configured Razorpay plan does not match $59 USD/month.");
      return NextResponse.json(
        { success: false, error: "The monthly plan is misconfigured. Please contact support." },
        { status: 503 }
      );
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({
        plan_id: monthlyPlanId,
        total_count: MONTHLY_SUBSCRIPTION_TOTAL_CYCLES,
        quantity: 1,
        customer_notify: true,
        notes: {
          user_id: auth.ctx.userId,
          plan: "monthly",
        },
      }),
    });

    if (!razorpayResponse.ok) {
      console.error("[payment/create-subscription] Razorpay request failed:", razorpayResponse.status);
      return NextResponse.json(
        { success: false, error: "Failed to start the monthly subscription." },
        { status: 502 }
      );
    }

    const razorpaySubscription =
      (await razorpayResponse.json()) as RazorpaySubscription;
    if (!razorpaySubscription.id) {
      console.error("[payment/create-subscription] Razorpay returned no subscription ID.");
      return NextResponse.json(
        { success: false, error: "Failed to start the monthly subscription." },
        { status: 502 }
      );
    }
    if (razorpaySubscription.plan_id !== monthlyPlanId) {
      const cancelResponse = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(razorpaySubscription.id)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authorization },
          body: JSON.stringify({ cancel_at_cycle_end: false }),
        }
      );
      if (!cancelResponse.ok) {
        console.error("[payment/create-subscription] Failed to cancel a subscription for the wrong plan.");
      }
      return NextResponse.json(
        { success: false, error: "The monthly plan could not be verified. Please contact support." },
        { status: 502 }
      );
    }

    const { error: insertError } = await supabaseAdmin.from("user_subscriptions").insert({
      user_id: auth.ctx.userId,
      razorpay_subscription_id: razorpaySubscription.id,
      razorpay_plan_id: monthlyPlanId,
      status: razorpaySubscription.status || "created",
    });

    if (insertError) {
      const { data: existingSubscription } = await supabaseAdmin
        .from("user_subscriptions")
        .select("user_id")
        .eq("razorpay_subscription_id", razorpaySubscription.id)
        .maybeSingle();
      if (existingSubscription?.user_id === auth.ctx.userId) {
        return NextResponse.json({
          success: true,
          subscriptionId: razorpaySubscription.id,
          amount: priceToSmallestUnit(MONTHLY_PRICE_USD),
          currency: "USD",
        });
      }

      const cancelResponse = await fetch(
        `https://api.razorpay.com/v1/subscriptions/${encodeURIComponent(razorpaySubscription.id)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: authorization },
          body: JSON.stringify({ cancel_at_cycle_end: false }),
        }
      );
      if (!cancelResponse.ok) {
        console.error(
          "[payment/create-subscription] Failed to cancel an unrecorded subscription:",
          cancelResponse.status
        );
      }
      console.error("[payment/create-subscription] Failed to record subscription:", insertError.message);
      return NextResponse.json(
        { success: false, error: "Failed to record the monthly subscription." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptionId: razorpaySubscription.id,
      amount: priceToSmallestUnit(MONTHLY_PRICE_USD),
      currency: "USD",
    });
  } catch (error) {
    console.error("[payment/create-subscription] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Subscription setup failed." },
      { status: 500 }
    );
  }
}
