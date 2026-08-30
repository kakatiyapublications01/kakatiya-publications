"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Library, ArrowRight, Sparkles } from "lucide-react";
import { VisitorTitle } from "@/types/visitor";

interface PersonalizedGreetingProps {
  title: VisitorTitle | string;
  fullName: string;
  onDismiss: () => void;
}

export function PersonalizedGreeting({
  title,
  fullName,
  onDismiss,
}: PersonalizedGreetingProps) {
  const [salutation, setSalutation] = useState<string>("Good evening");
  const [timeRemaining, setTimeRemaining] = useState<number>(4);

  useEffect(() => {
    // Determine time of day greeting based on local browser time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setSalutation("Good morning");
    } else if (hour >= 12 && hour < 17) {
      setSalutation("Good afternoon");
    } else {
      setSalutation("Good evening");
    }
  }, []);

  useEffect(() => {
    if (timeRemaining === 0) {
      onDismiss();
    }
  }, [timeRemaining, onDismiss]);

  useEffect(() => {
    // 4 second auto-dismiss timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const displayTitle = title && title !== "Other" ? `${title} ` : "";
  const greetingText = `${salutation}, ${displayTitle}${fullName}.`;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-[#E5E5E0] rounded-xl p-8 sm:p-12 shadow-xl text-center relative z-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Brand Logo Emblem */}
      <div className="relative w-20 h-20 mx-auto mb-4 p-1 rounded-full bg-[#F8F7F3] border border-[#E5E5E0]">
        <img
          src="/logo.png"
          alt="KakatiyaPulse"
          className="w-full h-full object-contain p-1"
        />
      </div>

      {/* Salutation & Welcome */}
      <div className="space-y-3 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14532D] tracking-tight leading-tight">
          {greetingText}
        </h1>

        <p className="font-serif text-xl sm:text-2xl text-[#555555] font-normal italic tracking-wide">
          Welcome to KakatiyaPulse.
        </p>
      </div>

      {/* Special Edition Highlight Box */}
      <div className="bg-[#F8F7F3] border border-[#E5E5E0] rounded-lg p-6 sm:p-8 space-y-4 my-6 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
          <Sparkles className="w-4 h-4 text-[#C9A227]" />
          <span>Here is our Special Edition</span>
        </div>

        <p className="text-[#555555] text-sm sm:text-base leading-relaxed font-sans">
          Discover our latest Special Edition, carefully curated to bring together stories, achievements, personalities and moments that matter to our community.
        </p>

        {/* Buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Link href="/magazines" onClick={onDismiss} className="flex-1 min-w-[200px]">
            <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-md bg-[#14532D] text-white hover:bg-[#166534] transition-all duration-200 shadow-sm cursor-pointer">
              <BookOpen className="w-4 h-4" />
              <span>Read the Special Edition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/magazines" onClick={onDismiss} className="flex-1 min-w-[180px]">
            <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium px-5 py-3 rounded-md bg-white border border-[#14532D] text-[#14532D] hover:bg-[#14532D]/5 transition-all duration-200 cursor-pointer">
              <Library className="w-4 h-4" />
              <span>Explore the Archive</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Auto-dismiss Countdown Indicator */}
      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-[#555555] font-sans">
        <span className="inline-block w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
        <span>Continuing to publication in {timeRemaining}s...</span>
        <button
          onClick={onDismiss}
          className="text-[#14532D] font-medium hover:underline ml-2 transition-colors cursor-pointer"
        >
          Skip now
        </button>
      </div>
    </div>
  );
}
