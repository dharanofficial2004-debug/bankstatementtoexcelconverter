import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const ADMIN_SESSION_COOKIE = "ste_adm";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password required." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey || !supabaseAdmin) {
      return NextResponse.json({ ok: false, error: "Server configuration missing." }, { status: 503 });
    }

    // Sign in via Supabase Auth to verify credentials
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await client.auth.signInWithPassword({ email, password });

    if (authError || !authData.session) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    const userId = authData.user.id;
    const accessToken = authData.session.access_token;

    // Verify admin status server-side via admin_users table
    const { data: adminRow } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.json({ ok: false, error: "This account does not have admin privileges." }, { status: 403 });
    }

    // Set HttpOnly admin session cookie containing the verified JWT
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const cookieValue = `${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_MAX_AGE}${secure}`;

    const response = NextResponse.json({ ok: true });
    response.headers.append("Set-Cookie", `${ADMIN_SESSION_COOKIE}=${cookieValue}`);
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Sign in failed. Please try again." }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout — clear the cookie for both path variants
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  // Clear Path=/ (current)
  response.headers.append("Set-Cookie", `ste_adm=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  // Clear Path=/admin (legacy, in case old cookie exists)
  response.headers.append("Set-Cookie", `ste_adm=; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  return response;
}
