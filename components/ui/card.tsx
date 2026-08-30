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
      className={`bg-white border border-[#E5E5E0] rounded-xl overflow-hidden transition-all duration-250 ${
        hoverEffect ? "hover:border-[#C9A227] hover:shadow-md" : "shadow-sm"
      } ${glow ? "border-[#C9A227]/60 shadow-md shadow-[#C9A227]/10" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 border-b border-[#E5E5E0] ${className}`} {...props}>
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
    <div className={`p-5 sm:p-6 border-t border-[#E5E5E0] bg-[#F8F7F3] ${className}`} {...props}>
      {children}
    </div>
  );
}
