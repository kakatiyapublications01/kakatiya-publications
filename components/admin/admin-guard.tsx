"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// Development admin email whitelist (remove for production)
const DEV_ADMIN_EMAILS = ["admin@kakatiyapulse.com", "test.admin@example.com", "sanjay@kakatiyapublications.com"];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [user, isAdmin, loading, router]);

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

  if (!user) {
    return null;
  }
  // Allow dev admins based on email whitelist
  const isDevAdmin = DEV_ADMIN_EMAILS.includes(user.email ?? "");
  if (!isAdmin && !isDevAdmin) {
    return null;
  }

  return <>{children}</>;
}
