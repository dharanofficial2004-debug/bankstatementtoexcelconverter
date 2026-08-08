import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_record_id,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_record_id) {
      return NextResponse.json(
        { success: false, error: "Missing required verification fields." },
        { status: 400 }
      );
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!razorpayKeySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured on the server." },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured on the server." },
        { status: 500 }
      );
    }

    // Authenticate user
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

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch");

      await supabaseAdmin
        .from("payments")
        .update({ payment_status: "signature_failed" })
        .eq("id", payment_record_id)
        .eq("user_id", user.id);

      return NextResponse.json(
        { success: false, error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // Signature valid — update payment record
    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
      })
      .eq("id", payment_record_id)
      .eq("user_id", user.id)
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError) {
      console.error("Failed to update payment record:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment record." },
        { status: 500 }
      );
    }

    // Read the payment record to know which plan was bought
    const { data: paymentData, error: paymentReadError } = await supabaseAdmin
      .from("payments")
      .select("filename, pages, plan")
      .eq("id", payment_record_id)
      .single();

    if (paymentReadError || !paymentData) {
      console.error("Failed to read payment record:", paymentReadError?.message);
      return NextResponse.json(
        { success: false, error: "Payment verified but record could not be read." },
        { status: 500 }
      );
    }

    const plan = paymentData.plan;

    if (plan === "lifetime") {
      // Grant lifetime access
      const { error: planError } = await supabaseAdmin
        .from("user_usage")
        .upsert(
          { user_id: user.id, plan: "lifetime", updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (planError) {
        console.error("Failed to grant lifetime plan:", planError);
      }
    } else if (plan === "per_conversion") {
      // Add one paid conversion credit
      const { data: existing } = await supabaseAdmin
        .from("user_usage")
        .select("paid_credits")
        .eq("user_id", user.id)
        .maybeSingle();

      const newCredits = (existing?.paid_credits || 0) + 1;
      const { error: creditError } = await supabaseAdmin
        .from("user_usage")
        .upsert(
          {
            user_id: user.id,
            plan: "payg",
            paid_credits: newCredits,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (creditError) {
        console.error("Failed to add paid credit:", creditError);
      }
    } else {
      // Legacy document payment — create conversion record
      await supabaseAdmin.from("conversions").insert({
        payment_id: payment_record_id,
        user_id: user.id,
        filename: paymentData.filename,
        pages: paymentData.pages,
        status: "pending",
      });
    }

    return NextResponse.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
