"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// Admin email whitelist — these emails bypass the Firebase admin claim check
const ADMIN_EMAILS = [
  "sanjay@kakatiyapublications.com",
  "admin@kakatiyapulse.com",
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const isWhitelisted = ADMIN_EMAILS.includes(user?.email ?? "");
  const hasAccess = isAdmin || isWhitelisted;

  useEffect(() => {
    if (!loading && (!user || !hasAccess)) {
      router.push("/admin/login");
    }
  }, [user, hasAccess, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#555555] space-y-4">
        <div className="w-10 h-10 border-2 border-[#14532D] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#555555] font-mono">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return <>{children}</>;
}
