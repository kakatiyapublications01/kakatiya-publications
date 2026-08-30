"use client";

import React, { useEffect, useState } from "react";
import { WelcomeForm } from "./welcome-form";
import { PersonalizedGreeting } from "./personalized-greeting";
import { VisitorPayload, StoredVisitor, VisitorTitle } from "@/types/visitor";

const LOCAL_STORAGE_KEY = "kp_visitor";

export function WelcomeFlow() {
  const [phase, setPhase] = useState<"checking" | "form" | "greeting" | "dismissed">("checking");
  const [visitorInfo, setVisitorInfo] = useState<{
    visitorId?: string;
    title: VisitorTitle | string;
    fullName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check localStorage for existing returning visitor
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsed: StoredVisitor = JSON.parse(storedData);
        if (parsed && parsed.fullName) {
          setVisitorInfo({
            visitorId: parsed.visitorId,
            title: parsed.title || "Mr.",
            fullName: parsed.fullName,
          });
          setPhase("greeting");

          // Ping server API to update lastVisitAt timestamp
          if (parsed.visitorId) {
            fetch("/api/visitors", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "ping", visitorId: parsed.visitorId }),
            }).catch((err) => console.warn("Failed to ping visitor lastVisitAt:", err));
          }
          return;
        }
      }
    } catch (err) {
      console.warn("Could not read visitor info from localStorage:", err);
    }

    // First-time visitor
    setPhase("form");
  }, []);

  const handleFormSubmit = async (payload: VisitorPayload) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...payload }),
      });

      const data = await res.json();
      const visitorId = data.visitorId || "";

      // Store visitor details in localStorage
      const storedVisitor: StoredVisitor = {
        visitorId,
        title: payload.title,
        fullName: payload.fullName,
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedVisitor));
      } catch (e) {
        console.warn("Failed to save visitor info to localStorage:", e);
      }

      setVisitorInfo({
        visitorId,
        title: payload.title,
        fullName: payload.fullName,
      });

      setPhase("greeting");
    } catch (err) {
      console.error("Error submitting visitor profile:", err);
      // Fallback: still show greeting even if API network failed offline
      setVisitorInfo({
        title: payload.title,
        fullName: payload.fullName,
      });
      setPhase("greeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = React.useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setPhase("dismissed");
    }, 400); // 400ms match fade-out duration
  }, []);

  if (phase === "checking" || phase === "dismissed") {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-opacity duration-400 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-h-[90vh] overflow-y-auto custom-scrollbar flex items-center justify-center py-4">
        {phase === "form" && (
          <WelcomeForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
        )}

        {phase === "greeting" && visitorInfo && (
          <PersonalizedGreeting
            title={visitorInfo.title}
            fullName={visitorInfo.fullName}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    </div>
  );
}
