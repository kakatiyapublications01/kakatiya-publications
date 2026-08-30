"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Eye } from "lucide-react";
import { StoredVisitor } from "@/types/visitor";

function getDeviceType(userAgent: string): "Desktop" | "Mobile" | "Tablet" {
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return "Tablet";
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return "Mobile";
  }
  return "Desktop";
}

function getBrowser(userAgent: string): "Chrome" | "Safari" | "Firefox" | "Edge" | "Other" {
  if (userAgent.indexOf("Edg") > -1) return "Edge";
  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) return "Safari";
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  return "Other";
}

export function LiveVisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const pathname = usePathname();

  // Initialize or retrieve Session ID from sessionStorage
  useEffect(() => {
    try {
      let id = sessionStorage.getItem("kp_session_id");
      if (!id) {
        id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("kp_session_id", id);
      }
      setSessionId(id);
    } catch (e) {
      setSessionId(`sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    }
  }, []);

  // Send Heartbeat to server
  const sendHeartbeat = useCallback(async () => {
    if (!sessionId) return;

    let visitorId: string | null = null;
    try {
      const storedVisitor = localStorage.getItem("kp_visitor");
      if (storedVisitor) {
        const parsed: StoredVisitor = JSON.parse(storedVisitor);
        if (parsed?.visitorId) visitorId = parsed.visitorId;
      }
    } catch (e) {
      // Ignore
    }

    try {
      const currentPath = pathname || (typeof window !== "undefined" ? window.location.pathname : "/");
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
      
      const device = getDeviceType(userAgent);
      const browser = getBrowser(userAgent);

      const res = await fetch("/api/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          page: currentPath,
          visitorId,
          device,
          browser
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number") {
          setCount(data.count);
        }
      }
    } catch (err) {
      console.warn("Failed to send live session heartbeat:", err);
    }
  }, [sessionId, pathname]);

  useEffect(() => {
    if (!sessionId) return;

    sendHeartbeat();

    // Heartbeat interval every 25 seconds
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }, 25000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, sendHeartbeat]);

  // Handle SPA navigation: when path changes, send heartbeat to update "Current Page"
  useEffect(() => {
    if (!sessionId) return;
    const handlePathChange = () => {
       sendHeartbeat();
    };
    
    // Monkey patch pushState/replaceState to detect Next.js client side navigations (or just rely on location change if not using router events)
    // A simpler way for App Router is to just listen to popstate and rely on the fact that layout re-renders. 
    // Actually, LiveVisitorCount is rendered in a layout that doesn't unmount, so we should just call sendHeartbeat when pathname changes.
    // However, we don't have usePathname here. Let's rely on standard interval + visibility for now, as usePathname requires navigation import.
  }, [sessionId, sendHeartbeat]);

  if (count === null) {
    return null;
  }

  const label = count === 1 ? "person reading now" : "people reading now";

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F8F7F3] border border-[#E5E5E0] text-[#1C1C1C] text-xs font-serif shadow-sm transition-all duration-300 hover:border-[#C9A227]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#166534] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#166534]" />
      </span>
      <Eye className="w-3.5 h-3.5 text-[#14532D] shrink-0" />
      <span className="tracking-wide">
        <strong className="font-semibold text-[#14532D] transition-all duration-200">{count}</strong> {label}
      </span>
    </div>
  );
}
