import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Portal Sign In",
  description: "Secure Administrator Access for Kakatiya Publications Management System.",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 relative overflow-hidden">
      {/* Background Gold Blur */}
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

          <form className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                placeholder="••••••••••••"
              />
            </div>

            <Button variant="gold" className="w-full font-semibold" size="md" type="button">
              Sign In to Dashboard
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
