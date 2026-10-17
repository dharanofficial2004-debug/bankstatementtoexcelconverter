import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseServer";

const ADMIN_SESSION_COOKIE = "ste_adm";

export interface AdminSession {
  userId: string;
  email: string;
}

/**
 * Reads the HttpOnly admin session cookie and verifies:
 * 1. The JWT is valid (via Supabase getUser)
 * 2. The user is in the admin_users table
 *
 * Returns the admin session if valid, null otherwise.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!supabaseAdmin) return null;

  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return null;

    // Verify token with Supabase
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return null;

    // Verify admin_users table membership
    const { data: adminRow } = await supabaseAdmin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!adminRow) return null;

    return {
      userId: data.user.id,
      email: data.user.email ?? "",
    };
  } catch {
    return null;
  }
}
