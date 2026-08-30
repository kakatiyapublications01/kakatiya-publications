import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "green" | "green-outline" | "gold" | "gold-outline" | "glass" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "green",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#14532D]/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-md";

  const sizeClasses = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5 font-semibold",
  };

  const variantClasses = {
    green:
      "bg-[#14532D] text-white hover:bg-[#166534] shadow-sm active:scale-[0.98]",
    "green-outline":
      "bg-white border border-[#14532D] text-[#14532D] hover:bg-[#14532D]/5 active:scale-[0.98]",
    gold:
      "bg-[#C9A227] text-white hover:bg-[#b89223] shadow-sm active:scale-[0.98]",
    "gold-outline":
      "bg-white border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 active:scale-[0.98]",
    glass:
      "bg-white border border-[#E5E5E0] text-[#1C1C1C] hover:border-[#14532D] hover:bg-[#F8F7F3] active:scale-[0.98]",
    ghost:
      "text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3] active:scale-[0.98]",
    danger:
      "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 active:scale-[0.98]",
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
