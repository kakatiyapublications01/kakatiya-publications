"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/lib/firebase/auth";

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
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/10 blur-[130px] rounded-full pointer-events-none" />

      <Container size="sm">
        <div className="glass-panel p-8 sm:p-10 rounded-xl border border-[#d4af37]/30 shadow-2xl max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <div className="relative w-48 h-12 mx-auto">
                <Image
                  src="/logo.svg"
                  alt="Kakatiya Publications"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-xs tracking-widest text-[#d4af37] uppercase font-semibold">
              Editorial Admin Portal
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded bg-red-950/80 border border-red-800/80 text-red-200 text-xs leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                placeholder="admin@kakatiyapublications.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                placeholder="••••••••••••"
              />
            </div>

            <Button
              variant="gold"
              className="w-full font-semibold"
              size="md"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Verifying Token..." : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="border-t border-zinc-800/80 pt-4 text-center">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Return to Kakatiya Publications Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
