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
    "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#14532D] disabled:opacity-40 disabled:cursor-not-allowed rounded-[2px]";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5 uppercase tracking-wider",
    md: "text-xs sm:text-sm px-5 py-2.5 gap-2 uppercase tracking-wider font-semibold",
    lg: "text-sm px-6 py-3 gap-2.5 uppercase tracking-wider font-bold",
  };

  const variantClasses = {
    green:
      "bg-[#14532D] text-white hover:bg-[#166534] border border-[#14532D]",
    "green-outline":
      "bg-transparent border border-[#14532D] text-[#14532D] hover:bg-[#14532D] hover:text-white",
    gold:
      "bg-[#C9A227] text-white hover:bg-[#b89223] border border-[#C9A227]",
    "gold-outline":
      "bg-transparent border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white",
    glass:
      "bg-white border border-[#E5E5E0] text-[#1C1C1C] hover:border-[#14532D] hover:bg-[#F8F7F3]",
    ghost:
      "text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3]",
    danger:
      "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100",
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
