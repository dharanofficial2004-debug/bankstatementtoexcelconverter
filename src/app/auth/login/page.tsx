"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginModal from "@/components/app/LoginModal";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-800">
            <FileSpreadsheet size={28} className="text-primary-600" />
            <span className="font-bold text-xl">StatementToExcel</span>
          </Link>
        </div>

        {/* Manual email/password/profession auth (no magic link) */}
        <LoginModal
          isOpen={true}
          onClose={() => router.push("/")}
          onLoginSuccess={() => router.push("/app")}
        />

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
