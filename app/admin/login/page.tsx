"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/lib/firebase/auth";

import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { isAdmin } = await loginAdmin(email, password);

      if (!isAdmin) {
        setError("Access Denied: Your account does not have administrator privilege claims.");
        setSubmitting(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.message || "Invalid authentication credentials. Please check and retry.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F3] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C9A227]/5 blur-[130px] rounded-full pointer-events-none" />

      <Container size="sm">
        <div className="bg-white p-8 sm:p-10 rounded-xl border border-[#E5E5E0] shadow-xl max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 mx-auto p-1 bg-[#F8F7F3] rounded-full border border-[#E5E5E0]">
                  <Image
                    src="/logo.png"
                    alt="KakatiyaPulse"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-serif text-xl font-bold text-[#14532D] tracking-wider leading-none">
                    KAKATIYA
                  </span>
                  <span className="text-xs font-bold text-[#C9A227] tracking-[0.35em] leading-tight mt-0.5">
                    PULSE
                  </span>
                </div>
              </div>
            </Link>
            <p className="text-xs tracking-widest text-[#C9A227] uppercase font-semibold">
              Editorial Admin Portal
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                placeholder="admin@kakatiyapulse.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#1C1C1C] font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F8F7F3] border border-[#E5E5E0] rounded-md px-4 py-2.5 text-sm text-[#1C1C1C] focus:outline-none focus:border-[#14532D]"
                placeholder="••••••••••••"
              />
            </div>

            <Button
              variant="green"
              className="w-full font-semibold cursor-pointer"
              size="md"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Verifying Token..." : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="border-t border-[#E5E5E0] pt-4 text-center">
            <Link href="/" className="text-xs text-[#555555] hover:text-[#14532D] transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to KakatiyaPulse Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
