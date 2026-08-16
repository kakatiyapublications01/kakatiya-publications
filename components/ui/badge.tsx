import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "gold" | "vvip" | "vip" | "neutral" | "success";
}

export function Badge({
  children,
  variant = "gold",
  className = "",
  ...props
}: BadgeProps) {
  const variantClasses = {
    gold: "bg-[#d4af37]/15 text-[#fde047] border border-[#d4af37]/40",
    vvip: "bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 text-yellow-300 border border-yellow-400/50 shadow-sm shadow-yellow-500/20 font-semibold tracking-wider uppercase",
    vip: "bg-zinc-800/80 text-amber-200 border border-amber-500/30",
    neutral: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    success: "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
