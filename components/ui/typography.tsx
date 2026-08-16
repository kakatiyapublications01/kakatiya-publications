import React from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export function H1({ children, gradient = false, className = "", ...props }: HeadingProps) {
  return (
    <h1
      className={`font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight ${
        gradient ? "gold-gradient-text" : "text-white"
      } ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, gradient = false, className = "", ...props }: HeadingProps) {
  return (
    <h2
      className={`font-serif text-3xl sm:text-4xl font-bold tracking-tight ${
        gradient ? "gold-gradient-text" : "text-white"
      } ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, gradient = false, className = "", ...props }: HeadingProps) {
  return (
    <h3
      className={`font-serif text-xl sm:text-2xl font-semibold tracking-tight ${
        gradient ? "gold-gradient-text" : "text-white"
      } ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function SectionSubtitle({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#d4af37] ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function Text({ children, className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-zinc-300 text-base leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
