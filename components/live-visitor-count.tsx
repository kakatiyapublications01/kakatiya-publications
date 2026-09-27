"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
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
        const active = typeof data.count === "number" ? data.count : typeof data.activeCount === "number" ? data.activeCount : null;
        if (typeof active === "number") {
          setCount(active);
        }
      }
    } catch (err) {
      console.warn("Live heartbeat error:", err);
    }
  }, [sessionId, pathname]);

  useEffect(() => {
    if (!sessionId) return;
    sendHeartbeat();

    const interval = setInterval(() => {
      sendHeartbeat();
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

  if (count === null || count < 1) {
    return null;
  }

  const label = count === 1 ? "reader online" : "readers online";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#555555] font-sans">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#166534]" />
      <span className="font-semibold text-[#14532D]">{count}</span>
      <span>{label}</span>
    </span>
  );
}
