import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authServer";
import { getAdminSession } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieSession = await getAdminSession();
  if (!cookieSession) {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    // ── 1. Auth users ────────────────────────────────────────────────────────
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const authUsers = usersData?.users || [];

    // ── 2. user_usage ─────────────────────────────────────────────────────────
    const { data: usageData } = await supabaseAdmin
      .from("user_usage")
      .select("user_id, conversions_used, plan, profession, paid_credits, trial_consumed_at");

    // ── 3. gemini_attempts — real AI usage per job ────────────────────────────
    const { data: attemptData } = await supabaseAdmin
      .from("gemini_attempts")
      .select("job_id, owner_type, owner_id, input_tokens, output_tokens, total_tokens, estimated_cost_usd, started_at, ended_at, duration_ms, status, model")
      .eq("status", "succeeded")
      .order("started_at", { ascending: false })
      .limit(5000);

    // ── 4. conversion_jobs — real conversions ────────────────────────────────
    const { data: jobData } = await supabaseAdmin
      .from("conversion_jobs")
      .select("id, owner_type, owner_id, user_id, guest_session_id, status, created_at, filename, extraction_kind, chunks_total")
      .order("created_at", { ascending: false })
      .limit(2000);

    // ── 5. payments ──────────────────────────────────────────────────────────
    const { data: paymentData } = await supabaseAdmin
      .from("payments")
      .select("user_id, plan, payment_status, price, currency, created_at, entitlements_applied_at")
      .eq("payment_status", "paid");

    // ── 6. guest_sessions — for guest AI usage attribution ───────────────────
    const { data: guestData } = await supabaseAdmin
      .from("guest_sessions")
      .select("id, linked_user_id, trial_used, created_at, country_code, city");

    // ── 7. analytics_events — funnel + geo + page views ──────────────────────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();
    const { data: analyticsData } = await supabaseAdmin
      .from("analytics_events")
      .select("event_type, country_code, city, created_at, owner_type, metadata")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(10000);

    const usageMap: Record<string, { conversionsUsed: number; plan: string; profession: string | null; paidCredits: number; trialConsumed: boolean }> = {};
    for (const u of usageData || []) {
      usageMap[u.user_id] = {
        conversionsUsed: Number(u.conversions_used) || 0,
        plan: (u.plan as string) || "free",
        profession: (u.profession as string) || null,
        paidCredits: Number(u.paid_credits) || 0,
        trialConsumed: Boolean(u.trial_consumed_at),
      };
    }

    // Guest lookup by id
    const guestMap: Record<string, { linkedUserId: string | null; trialUsed: boolean }> = {};
    for (const g of guestData || []) {
      guestMap[g.id] = { linkedUserId: g.linked_user_id, trialUsed: g.trial_used };
    }

    // Payments per user
    const paymentMap: Record<string, { totalPaid: number; plan: string; lastPayment: string }> = {};
    for (const p of paymentData || []) {
      if (!paymentMap[p.user_id]) {
        paymentMap[p.user_id] = { totalPaid: 0, plan: p.plan || "", lastPayment: p.created_at };
      }
      paymentMap[p.user_id].totalPaid += Number(p.price) || 0;
      if (p.plan === "lifetime") paymentMap[p.user_id].plan = "lifetime";
    }

    // Gemini usage aggregated per owner
    let globalInput = 0, globalOutput = 0, globalTotal = 0, globalCost = 0;
    const aiByOwner: Record<string, { input: number; output: number; total: number; cost: number; calls: number }> = {};

    for (const a of attemptData || []) {
      const inp = Number(a.input_tokens) || 0;
      const out = Number(a.output_tokens) || 0;
      const tot = Number(a.total_tokens) || inp + out;
      const cost = Number(a.estimated_cost_usd) || 0;
      globalInput += inp; globalOutput += out; globalTotal += tot; globalCost += cost;

      // Resolve owner: if guest, try to find linked user
      let resolvedOwnerId = a.owner_id as string;
      if (a.owner_type === "guest") {
        const guest = guestMap[a.owner_id as string];
        if (guest?.linkedUserId) resolvedOwnerId = guest.linkedUserId;
      }

      if (!aiByOwner[resolvedOwnerId]) aiByOwner[resolvedOwnerId] = { input: 0, output: 0, total: 0, cost: 0, calls: 0 };
      aiByOwner[resolvedOwnerId].input += inp;
      aiByOwner[resolvedOwnerId].output += out;
      aiByOwner[resolvedOwnerId].total += tot;
      aiByOwner[resolvedOwnerId].cost += cost;
      aiByOwner[resolvedOwnerId].calls += 1;
    }

    // Conversions per user
    const jobsByUser: Record<string, number> = {};
    const successfulJobsCount = (jobData || []).filter(j => j.status === "ready").length;
    for (const j of jobData || []) {
      if (j.status === "ready" && j.user_id) {
        jobsByUser[j.user_id] = (jobsByUser[j.user_id] || 0) + 1;
      }
    }

    // Build user list
    const userList = authUsers.map((u, idx) => {
      const usage = usageMap[u.id] || { conversionsUsed: 0, plan: "free", profession: null, paidCredits: 0, trialConsumed: false };
      const ai = aiByOwner[u.id] || { input: 0, output: 0, total: 0, cost: 0, calls: 0 };
      const pay = paymentMap[u.id];
      const actualConversions = jobsByUser[u.id] || usage.conversionsUsed;
      return {
        sno: idx + 1,
        userId: u.id,
        email: u.email || "No Email",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
        conversionsUsed: actualConversions,
        plan: usage.plan,
        profession: usage.profession,
        paidCredits: usage.paidCredits,
        trialConsumed: usage.trialConsumed,
        hasPaid: !!pay,
        totalPaidAmount: pay?.totalPaid || 0,
        inputTokens: ai.input,
        outputTokens: ai.output,
        totalTokens: ai.total,
        estimatedCostUsd: ai.cost,
        aiCalls: ai.calls,
      };
    });

    // Gemini attempts for AI usage tab (last 100)
    const aiUsageLogs = (attemptData || []).slice(0, 100).map(a => {
      // Resolve email
      let email = "Guest";
      if (a.owner_type === "user") {
        const u = authUsers.find(x => x.id === a.owner_id);
        email = u?.email || a.owner_id as string;
      } else {
        const g = guestMap[a.owner_id as string];
        if (g?.linkedUserId) {
          const u = authUsers.find(x => x.id === g.linkedUserId);
          email = u?.email || "Guest (linked)";
        }
      }
      return {
        jobId: a.job_id,
        ownerType: a.owner_type,
        email,
        inputTokens: Number(a.input_tokens) || 0,
        outputTokens: Number(a.output_tokens) || 0,
        totalTokens: Number(a.total_tokens) || 0,
        estimatedCostUsd: Number(a.estimated_cost_usd) || 0,
        durationMs: Number(a.duration_ms) || 0,
        model: a.model || "gemini-2.5-flash-lite",
        startedAt: a.started_at,
        status: a.status,
      };
    });

    // Recent conversions
    const recentJobs = (jobData || []).slice(0, 50).map(j => {
      let email = "Guest";
      if (j.user_id) {
        const u = authUsers.find(x => x.id === j.user_id);
        email = u?.email || j.user_id;
      }
      return {
        id: j.id,
        email,
        status: j.status,
        filename: j.filename,
        extractionKind: j.extraction_kind,
        createdAt: j.created_at,
      };
    });

    // ── Analytics funnel (last 7 days) ────────────────────────────────────────
    const events = analyticsData || [];
    const funnelCounts = {
      page_view: events.filter(e => e.event_type === "page_view").length,
      extract: events.filter(e => e.event_type === "extract").length,
      convert: events.filter(e => e.event_type === "convert").length,
      export: events.filter(e => e.event_type === "export").length,
      signup: events.filter(e => e.event_type === "signup").length,
    };

    // Top countries from analytics
    const countryMap: Record<string, number> = {};
    for (const e of events) {
      if (e.country_code) countryMap[e.country_code] = (countryMap[e.country_code] || 0) + 1;
    }
    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));

    // Events per day (last 7 days)
    const dayMap: Record<string, number> = {};
    for (const e of events) {
      const day = e.created_at.slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
    const eventsPerDay = Object.entries(dayMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: authUsers.length,
        totalConversions: successfulJobsCount,
        totalInputTokens: globalInput,
        totalOutputTokens: globalOutput,
        totalTokens: globalTotal,
        estimatedCostUsd: globalCost,
        paidUsers: Object.keys(paymentMap).length,
        freeUsers: authUsers.length - Object.keys(paymentMap).length,
      },
      users: userList,
      aiUsageLogs,
      recentJobs,
      analytics: {
        funnel: funnelCounts,
        topCountries,
        eventsPerDay,
      },
    });
  } catch (err) {
    console.error("admin/stats error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
