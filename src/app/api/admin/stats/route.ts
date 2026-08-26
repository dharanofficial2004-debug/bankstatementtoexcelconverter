import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Verify admin password
    if (password !== "Dharan1424#$$") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Supabase Service Role Key is not configured." },
        { status: 500 }
      );
    }

    // 1. Fetch all Auth Users from Supabase Auth
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) {
      console.error("Error fetching users:", usersError);
    }
    const authUsers = usersData?.users || [];

    // 2. Fetch all user_usage records
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from("user_usage")
      .select("*");
    if (usageError) {
      console.error("Error fetching user_usage:", usageError);
    }

    // 3. Fetch all token_usage records
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from("token_usage")
      .select("*")
      .order("created_at", { ascending: false });
    if (tokenError) {
      console.error("Error fetching token_usage:", tokenError);
    }

    const tokenRecords = tokenData || [];
    const usageRecords = usageData || [];

    // Map all auth users cleanly
    const userMap: Record<
      string,
      {
        userId: string;
        email: string;
        createdAt: string;
        lastSignInAt: string | null;
        conversionsUsed: number;
        plan: string;
        profession: string | null;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCostUsd: number;
        totalRequests: number;
      }
    > = {};

    authUsers.forEach((u) => {
      userMap[u.id] = {
        userId: u.id,
        email: u.email || "No Email",
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
        conversionsUsed: 0,
        plan: "free",
        profession: null,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        totalRequests: 0,
      };
    });

    // Populate user_usage
    usageRecords.forEach((u) => {
      if (userMap[u.user_id]) {
        userMap[u.user_id].conversionsUsed = u.conversions_used || 0;
        userMap[u.user_id].plan = u.plan || "free";
        userMap[u.user_id].profession = u.profession || null;
      }
    });

    // Aggregate token_usage
    let globalInputTokens = 0;
    let globalOutputTokens = 0;
    let globalTotalTokens = 0;
    let globalEstimatedCost = 0;

    tokenRecords.forEach((t) => {
      const input = Number(t.input_tokens) || 0;
      const output = Number(t.output_tokens) || 0;
      const total = Number(t.total_tokens) || (input + output);
      const cost = Number(t.estimated_total_cost_usd || (input * 0.0000004 + output * 0.0000016));

      globalInputTokens += input;
      globalOutputTokens += output;
      globalTotalTokens += total;
      globalEstimatedCost += cost;

      if (t.user_id && userMap[t.user_id]) {
        userMap[t.user_id].inputTokens += input;
        userMap[t.user_id].outputTokens += output;
        userMap[t.user_id].totalTokens += total;
        userMap[t.user_id].estimatedCostUsd += cost;
        userMap[t.user_id].totalRequests += 1;
      }
    });

    const userList = Object.values(userMap).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalConversions = userList.reduce((acc, u) => acc + u.conversionsUsed, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: authUsers.length,
        totalConversions,
        totalInputTokens: globalInputTokens,
        totalOutputTokens: globalOutputTokens,
        totalTokens: globalTotalTokens,
        totalEstimatedCostUsd: globalEstimatedCost,
      },
      users: userList,
    });
  } catch (error) {
    console.error("Error in admin stats API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
