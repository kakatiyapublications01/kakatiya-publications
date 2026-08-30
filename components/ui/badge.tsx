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
    gold: "bg-[#F8F7F3] text-[#C9A227] border border-[#E8D48A] font-medium",
    vvip: "bg-[#14532D]/10 text-[#14532D] border border-[#C9A227] font-semibold tracking-wider uppercase",
    vip: "bg-[#F8F7F3] text-[#14532D] border border-[#E5E5E0] font-medium",
    neutral: "bg-[#F8F7F3] text-[#555555] border border-[#E5E5E0]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
