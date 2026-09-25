"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoot() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to the dashboard (or login if not authenticated)
    router.replace("/admin/dashboard");
  }, [router]);

  // Render nothing while redirecting
  return null;
}
