import type { Metadata } from "next";
import { getAdminSession } from "@/lib/adminSession";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin — StatementToExcel",
  other: {
    "X-Robots-Tag": "noindex",
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLogin />;
  }

  return <AdminDashboard adminEmail={session.email} />;
}
