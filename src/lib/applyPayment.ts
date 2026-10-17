import "server-only";
import { supabaseAdmin } from "./supabaseServer";

export async function applyPaidPayment(paymentId: string): Promise<string> {
  if (!supabaseAdmin) return "unconfigured";
  const { data, error } = await supabaseAdmin.rpc("apply_verified_payment", { p_payment_id: paymentId });
  if (error) {
    console.error("[apply_verified_payment]", error.message);
    return "error";
  }
  return typeof data === "string" ? data : "applied";
}

export async function reconcileRazorpayCapture(opts: {
  orderId: string;
  paymentId: string;
  eventId?: string;
}) {
  if (!supabaseAdmin) return;
  const { data: row } = await supabaseAdmin
    .from("payments")
    .select("id, payment_status, entitlements_applied_at")
    .eq("razorpay_order_id", opts.orderId)
    .maybeSingle();
  if (!row) return;
  if (row.payment_status !== "paid") {
    await supabaseAdmin
      .from("payments")
      .update({
        payment_status: "paid",
        razorpay_payment_id: opts.paymentId,
        razorpay_event_id: opts.eventId ?? null,
      })
      .eq("id", row.id)
      .neq("payment_status", "paid");
  }
  await applyPaidPayment(row.id);
}
