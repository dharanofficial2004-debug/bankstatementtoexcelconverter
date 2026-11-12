import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import {
  fetchRazorpaySubscription,
  getRazorpayCredentials,
  unixTimestampToIso,
  verifyRazorpaySignature,
} from "@/lib/razorpaySubscriptions";

export const dynamic = "force-dynamic";

interface SubscriptionWebhookEvent {
  event?: unknown;
  payload?: {
    subscription?: {
      entity?: {
        id?: unknown;
        notes?: unknown;
      };
    };
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getUserIdFromNotes(notes: unknown): string | null {
  if (!isRecord(notes) || typeof notes.user_id !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(notes.user_id)
    ? notes.user_id
    : null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook configuration missing." }, { status: 503 });
  }
  if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server configuration missing." }, { status: 503 });
  }

  const eventId = request.headers.get("x-razorpay-event-id");
  if (!eventId) {
    return NextResponse.json({ error: "Missing webhook event ID." }, { status: 400 });
  }

  let event: SubscriptionWebhookEvent;
  try {
    event = JSON.parse(rawBody) as SubscriptionWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (typeof event.event !== "string" || !event.event.startsWith("subscription.")) {
    return NextResponse.json({ received: true });
  }

  const payloadSubscription = event.payload?.subscription?.entity;
  const subscriptionId =
    typeof payloadSubscription?.id === "string" ? payloadSubscription.id : null;
  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing subscription in webhook payload." }, { status: 400 });
  }

  const { data: processedEvent, error: eventLookupError } = await supabaseAdmin
    .from("razorpay_subscription_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (eventLookupError) {
    console.error("[payment/subscription-webhook] Event lookup failed:", eventLookupError.message);
    return NextResponse.json({ error: "Webhook processing is temporarily unavailable." }, { status: 500 });
  }
  if (processedEvent) return NextResponse.json({ received: true, duplicate: true });

  try {
    const { authorization } = getRazorpayCredentials();
    const subscription = await fetchRazorpaySubscription(subscriptionId, authorization);
    const monthlyPlanId = process.env.RAZORPAY_MONTHLY_PLAN_ID;
    if (!monthlyPlanId) {
      return NextResponse.json({ error: "Monthly plan configuration missing." }, { status: 503 });
    }

    if (subscription.plan_id !== monthlyPlanId) {
      const { error: ignoredEventError } = await supabaseAdmin
        .from("razorpay_subscription_events")
        .insert({ event_id: eventId, event_type: event.event });
      if (ignoredEventError && !/(duplicate|unique|23505)/i.test(ignoredEventError.message)) {
        throw ignoredEventError;
      }
      return NextResponse.json({ received: true, ignored: true });
    }

    const { data: existing } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, cancel_at_cycle_end")
      .eq("razorpay_subscription_id", subscriptionId)
      .maybeSingle();
    const userId =
      existing?.user_id ??
      getUserIdFromNotes(subscription.notes) ??
      getUserIdFromNotes(payloadSubscription?.notes);

    if (!userId) {
      console.warn("[payment/subscription-webhook] Ignoring an unrecognized subscription event.");
      const { error: ignoredEventError } = await supabaseAdmin
        .from("razorpay_subscription_events")
        .insert({ event_id: eventId, event_type: event.event });
      if (ignoredEventError && !/(duplicate|unique|23505)/i.test(ignoredEventError.message)) {
        throw ignoredEventError;
      }
      return NextResponse.json({ received: true, ignored: true });
    }

    const { error: upsertError } = await supabaseAdmin.from("user_subscriptions").upsert(
      {
        user_id: userId,
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: subscription.plan_id,
        status: subscription.status,
        current_start: unixTimestampToIso(subscription.current_start),
        current_end: unixTimestampToIso(subscription.current_end),
        cancel_at_cycle_end:
          subscription.has_scheduled_changes ?? existing?.cancel_at_cycle_end ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "razorpay_subscription_id" }
    );

    if (upsertError) {
      console.error("[payment/subscription-webhook] Subscription update failed:", upsertError.message);
      return NextResponse.json({ error: "Failed to update subscription status." }, { status: 500 });
    }

    const { error: eventInsertError } = await supabaseAdmin
      .from("razorpay_subscription_events")
      .insert({ event_id: eventId, event_type: event.event });
    if (eventInsertError && !/(duplicate|unique|23505)/i.test(eventInsertError.message)) {
      console.error("[payment/subscription-webhook] Event record failed:", eventInsertError.message);
      return NextResponse.json({ error: "Failed to record subscription event." }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[payment/subscription-webhook] Error:", error);
    return NextResponse.json({ error: "Failed to process subscription event." }, { status: 500 });
  }
}
