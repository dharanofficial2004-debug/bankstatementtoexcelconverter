import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { validAffitorClickId } from "@/lib/affitor-server";
import {
  LIFETIME_PRICE_INR,
  PER_CONVERSION_PRICE_INR,
  LIFETIME_OFFER_LIMIT,
  inrToPaisa,
} from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (plan !== "lifetime" && plan !== "per_conversion") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid plan. Use 'lifetime' or 'per_conversion'." },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Server configuration missing." },
        { status: 503 }
      );
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured on the server." },
        { status: 503 }
      );
    }

    const auth = await authenticate(request);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.response.status === 401 ? "Authentication required." : "Invalid session." },
        { status: auth.response.status || 401 }
      );
    }

    const priceINR = plan === "lifetime" ? LIFETIME_PRICE_INR : PER_CONVERSION_PRICE_INR;
    const filename = plan === "lifetime" ? "Lifetime Access" : "Per Conversion Credit";
    const documentSize = "Plan";

    // ── Lifetime sold-out check ─────────────────────────────────────
    if (plan === "lifetime") {
      const { count, error: countError } = await supabaseAdmin
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("plan", "lifetime")
        .eq("payment_status", "paid");

      if (countError) {
        console.error("Failed to count lifetime purchases:", countError);
        return NextResponse.json(
          { success: false, error: "Failed to check offer availability." },
          { status: 500 }
        );
      }

      if (count !== null && count >= LIFETIME_OFFER_LIMIT) {
        return NextResponse.json(
          { success: false, error: "Lifetime offer sold out." },
          { status: 400 }
        );
      }
    }

    // ── Create Razorpay order ───────────────────────────────────────
    const razorpayAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
    const clickId = validAffitorClickId(request.cookies.get("affitor_click_id")?.value) || "";

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${razorpayAuth}`,
      },
      body: JSON.stringify({
        amount: inrToPaisa(priceINR),
        currency: "INR",
        receipt: `receipt_${Date.now()}_${auth.ctx.userId.slice(0, 8)}`,
        notes: {
          plan,
          user_id: auth.ctx.userId,
          affitor_click_id: clickId,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errText = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errText);
      return NextResponse.json(
        { success: false, error: "Failed to create payment order." },
        { status: 500 }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    // ── Insert payment record ───────────────────────────────────────
    const { data: paymentRecord, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: auth.ctx.userId,
        filename,
        pages: 0,
        words: 0,
        characters: 0,
        size_score: 0,
        document_size: documentSize,
        price: priceINR,
        currency: "INR",
        payment_status: "created",
        razorpay_order_id: razorpayOrder.id,
        plan,
        affitor_click_id: clickId || null,
        razorpay_raw_notes: { plan, user_id: auth.ctx.userId, affitor_click_id: clickId },
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert payment record:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to record payment." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: inrToPaisa(priceINR),
      currency: "INR",
      paymentRecordId: paymentRecord.id,
      plan,
      priceINR,
    });
  } catch (error) {
    console.error("Payment create-order error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
