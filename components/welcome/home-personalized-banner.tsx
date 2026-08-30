"use client";

import React, { useEffect, useState } from "react";
import { StoredVisitor } from "@/types/visitor";

export function HomePersonalizedBanner() {
  const [visitor, setVisitor] = useState<StoredVisitor | null>(null);
  const [salutation, setSalutation] = useState<string>("Good evening");

  useEffect(() => {
    // Time of day greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setSalutation("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setSalutation("Good afternoon");
    } else {
      setSalutation("Good evening");
    }

    try {
      const stored = localStorage.getItem("kp_visitor");
      if (stored) {
        const parsed: StoredVisitor = JSON.parse(stored);
        if (parsed && parsed.fullName) {
          setVisitor(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read kp_visitor from localStorage:", e);
    }
  }, []);

  if (!visitor || !visitor.fullName) {
    return null;
  }

  // Get first name or display title + fullName
  const firstName = visitor.fullName.split(" ")[0];
  const displayTitle = visitor.title && visitor.title !== "Other" ? `${visitor.title} ` : "";

  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8F7F3] border border-[#E5E5E0] text-xs sm:text-sm font-serif text-[#555555] shadow-sm animate-in fade-in duration-300">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
      <span>
        {salutation}, <strong className="font-semibold text-[#14532D]">{displayTitle}{firstName}</strong> — Welcome to KakatiyaPulse
      </span>
    </div>
  );
}
