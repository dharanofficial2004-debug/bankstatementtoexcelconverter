import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPrice, priceToSmallestUnit } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const { pages, words, characters, filename } = await request.json();

    if (!pages || !words || !characters || !filename) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: pages, words, characters, filename" },
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

    // Calculate pricing
    const pricing = getPrice({ pages, words, characters });
    const amountInCents = priceToSmallestUnit(pricing.priceUSD);

    // Create Razorpay order
    const razorpayAuth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${razorpayAuth}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: "USD",
        receipt: `receipt_${Date.now()}`,
        notes: {
          filename,
          pages: String(pages),
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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: paymentRecord, error: insertError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        filename,
        pages,
        words,
        characters,
        size_score: pricing.sizeScore,
        document_size: pricing.documentSize,
        price: pricing.priceUSD,
        currency: "USD",
        payment_status: "created",
        razorpay_order_id: razorpayOrder.id,
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
      amount: amountInCents,
      currency: "USD",
      paymentRecordId: paymentRecord.id,
      priceUSD: pricing.priceUSD,
      sizeScore: pricing.sizeScore,
      documentSize: pricing.documentSize,
    });
  } catch (error) {
    console.error("Payment create-order error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
