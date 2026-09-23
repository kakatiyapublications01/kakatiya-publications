import React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  gradient?: boolean; // Kept for backwards compatibility, but rendered with solid editorial colors
}

export function H1({ children, className = "", ...props }: HeadingProps) {
  return (
    <h1
      className={`font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1C1C] ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className = "", ...props }: HeadingProps) {
  return (
    <h2
      className={`font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1C1C] ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className = "", ...props }: HeadingProps) {
  return (
    <h3
      className={`font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1C1C] ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function SectionSubtitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#C9A227] ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function Text({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-[#555555] text-base leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

/**
 * Editorial Section Header:
 * TITLE
 * ────────────────────────────
 * Thin gold or neutral rule divider
 */
export function EditorialHeader({
  title,
  subtitle,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 mb-8 ${className}`}>
      {subtitle && (
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C9A227]">
          {subtitle}
        </p>
      )}
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D] tracking-tight uppercase">
          {title}
        </h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="h-[1px] w-full bg-[#C9A227]/40 mt-2" />
    </div>
  );
}
