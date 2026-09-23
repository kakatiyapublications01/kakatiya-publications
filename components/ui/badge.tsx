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
    gold: "bg-[#F8F7F3] text-[#C9A227] border border-[#C9A227]/50 font-medium",
    vvip: "bg-[#14532D] text-[#F8F7F3] border border-[#C9A227] font-semibold tracking-widest uppercase",
    vip: "bg-[#F8F7F3] text-[#14532D] border border-[#14532D]/30 font-medium",
    neutral: "bg-white text-[#555555] border border-[#E5E5E0]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] uppercase tracking-wider ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
