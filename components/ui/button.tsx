import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "gold-outline" | "glass" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "gold",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5 font-semibold",
  };

  const variantClasses = {
    gold: "bg-gradient-to-r from-[#d4af37] via-[#eab308] to-[#b89228] text-zinc-950 hover:brightness-110 shadow-lg shadow-[#d4af37]/20 active:scale-[0.98]",
    "gold-outline":
      "border border-[#d4af37]/60 text-[#d4af37] hover:bg-[#d4af37]/10 hover:border-[#d4af37] active:scale-[0.98]",
    glass:
      "bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:border-[#d4af37]/40 hover:text-white hover:bg-zinc-800/80 active:scale-[0.98]",
    ghost:
      "text-zinc-300 hover:text-white hover:bg-zinc-800/50 active:scale-[0.98]",
    danger:
      "bg-red-950/80 border border-red-800/60 text-red-200 hover:bg-red-900 active:scale-[0.98]",
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
