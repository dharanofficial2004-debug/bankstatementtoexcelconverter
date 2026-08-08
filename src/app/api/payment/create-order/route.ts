import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

import {
  LIFETIME_PRICE_INR,
  PER_CONVERSION_PRICE_INR,
  LIFETIME_OFFER_LIMIT,
  inrToPaisa,
} from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (plan !== "lifetime" && plan !== "per_conversion") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid plan. Use 'lifetime' or 'per_conversion'." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured on the server." },
        { status: 500 }
      );
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured on the server." },
        { status: 500 }
      );
    }

    // Authenticate user from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Determine fixed INR price for the plan
    const priceINR = plan === "lifetime" ? LIFETIME_PRICE_INR : PER_CONVERSION_PRICE_INR;
    const filename = plan === "lifetime" ? "Lifetime Access" : "Per Conversion Credit";
    const documentSize = "Plan";

    // Lifetime offer sold-out check
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

    // Create Razorpay order
    const razorpayAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${razorpayAuth}`,
      },
      body: JSON.stringify({
        amount: inrToPaisa(priceINR),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          plan,
          user_id: user.id,
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

    // Insert payment record into Supabase
    const { data: paymentRecord, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
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
