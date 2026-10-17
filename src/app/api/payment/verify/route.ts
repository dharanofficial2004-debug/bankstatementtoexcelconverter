import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticate } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseServer";

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
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay is not configured on the server." },
        { status: 503 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Server configuration missing." },
        { status: 503 }
      );
    }

    const auth = await authenticate(request);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    // ── Verify Razorpay signature ────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) {
      console.error("[payment/verify] Razorpay signature mismatch");

      await supabaseAdmin
        .from("payments")
        .update({ payment_status: "signature_failed" })
        .eq("id", payment_record_id)
        .eq("user_id", auth.ctx.userId);

      return NextResponse.json(
        { success: false, error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }

    // ── Idempotency: if payment already verified, short-circuit ──────
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id, payment_status, razorpay_payment_id, razorpay_order_id, user_id, plan, filename, pages")
      .eq("id", payment_record_id)
      .single() as unknown as {
        data: {
          id: unknown;
          payment_status: string;
          razorpay_payment_id: string | null;
          razorpay_order_id: string;
          user_id: string;
          plan: string;
          filename: string;
          pages: number;
        } | null;
      };

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found." },
        { status: 404 }
      );
    }

    if (existingPayment.user_id !== auth.ctx.userId) {
      return NextResponse.json(
        { success: false, error: "Payment record does not belong to the authenticated user." },
        { status: 403 }
      );
    }

    if (existingPayment.payment_status === "paid") {
      // Already paid: nothing more to do. Idempotent success.
      return NextResponse.json({
        success: true,
        verified: true,
        idempotent: true,
      });
    }

    if (existingPayment.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json(
        { success: false, error: "Razorpay order id mismatch with payment record." },
        { status: 400 }
      );
    }

    // ── Mark payment PAID (unique razorpay_payment_id prevents double applies) ──
    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        payment_status: "paid",
        razorpay_payment_id,
      })
      .eq("id", payment_record_id)
      .eq("payment_status", existingPayment.payment_status)
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError) {
      if (/(duplicate|unique|23505)/i.test(updateError.message || "")) {
        const { applyPaidPayment } = await import("@/lib/applyPayment");
        await applyPaidPayment(payment_record_id);
        return NextResponse.json({
          success: true,
          verified: true,
          idempotent: true,
        });
      }
      console.error("[payment/verify] Failed to update payment record:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment record." },
        { status: 500 }
      );
    }

    const { applyPaidPayment } = await import("@/lib/applyPayment");
    const applied = await applyPaidPayment(payment_record_id);
    if (applied === "error") {
      return NextResponse.json(
        { success: false, error: "Payment recorded. Entitlement apply is retrying." },
        { status: 500 }
      );
    }

    if (existingPayment.plan !== "lifetime" && existingPayment.plan !== "per_conversion") {
      try {
        await supabaseAdmin.from("conversions").insert({
          payment_id: payment_record_id,
          user_id: auth.ctx.userId,
          filename: existingPayment.filename,
          pages: existingPayment.pages,
          status: "pending",
        });
      } catch (convErr) {
        console.error("[payment/verify] Legacy conversion insert failed:", convErr);
      }
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
