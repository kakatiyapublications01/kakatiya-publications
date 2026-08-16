import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glow?: boolean;
}

export function Card({
  children,
  hoverEffect = true,
  glow = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`glass-panel rounded-lg overflow-hidden transition-all duration-300 ${
        hoverEffect ? "glass-panel-hover" : ""
      } ${glow ? "border-[#d4af37]/40 shadow-lg shadow-[#d4af37]/10" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 border-b border-zinc-800/80 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 border-t border-zinc-800/80 bg-zinc-950/40 ${className}`} {...props}>
      {children}
    </div>
  );
}
