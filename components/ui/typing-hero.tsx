"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export const DEFAULT_TYPING_SEQUENCES = [
  "కాకతీయ పబ్లికేషన్స్ ప్రత్యేక సంచిక 2026",
  "దామచర్ల జనార్ధన్ అను నేను...",
  "ఒంగోలు నవ్యజగతి సృష్టికర్త",
] as const;

type TypingPhase = "idle" | "typing" | "pausing" | "deleting" | "waiting";

export interface TypingHeroProps {
  /** Lines cycled through the typewriter. Defaults to the 2026 special-edition Telugu hero lines. */
  sequences?: readonly string[];
  /** Milliseconds per typed grapheme. */
  typingSpeed?: number;
  /** Milliseconds per deleted grapheme. */
  deletingSpeed?: number;
  /** Full-text hold before deletion starts. */
  pauseDuration?: number;
  /** Delay before the next line starts typing. */
  restartDelay?: number;
  /** Delay before the very first character is typed. */
  startDelay?: number;
  /** Keep cycling forever. Set false to stop on the final line. */
  loop?: boolean;
  label?: string;
  subtitle?: string;
  showCursor?: boolean;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
  subtitleClassName?: string;
}

/**
 * Split into grapheme clusters so Telugu matras / conjuncts are never rendered
 * half-formed while typing (surrogate pairs stay intact too).
 */
function segmentGraphemes(value: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("te", { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (entry) => entry.segment);
  }
  return Array.from(value);
}

function useTypewriter({
  lines,
  typingSpeed,
  deletingSpeed,
  pauseDuration,
  restartDelay,
  startDelay,
  loop,
  enabled,
}: {
  lines: readonly string[];
  typingSpeed: number;
  deletingSpeed: number;
  pauseDuration: number;
  restartDelay: number;
  startDelay: number;
  loop: boolean;
  enabled: boolean;
}) {
  const graphemes = React.useMemo(() => lines.map(segmentGraphemes), [lines]);
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [phase, setPhase] = React.useState<TypingPhase>("idle");

  React.useEffect(() => {
    if (!enabled) return;

    const current = graphemes[index] ?? graphemes[0] ?? [];
    const isLastLine = index >= graphemes.length - 1;
    let timer: ReturnType<typeof setTimeout> | undefined;

    switch (phase) {
      case "idle":
        timer = setTimeout(() => setPhase("typing"), startDelay);
        break;

      case "typing":
        if (count < current.length) {
          timer = setTimeout(
            () => setCount((value) => Math.min(value + 1, current.length)),
            typingSpeed
          );
        } else {
          timer = setTimeout(() => setPhase("pausing"), 0);
        }
        break;

      case "pausing":
        if (isLastLine && !loop) break;
        timer = setTimeout(() => setPhase("deleting"), pauseDuration);
        break;

      case "deleting":
        if (count > 0) {
          timer = setTimeout(() => setCount((value) => Math.max(value - 1, 0)), deletingSpeed);
        } else {
          timer = setTimeout(() => {
            setIndex((value) => (value + 1) % graphemes.length);
            setPhase("waiting");
          }, 0);
        }
        break;

      case "waiting":
        timer = setTimeout(() => setPhase("typing"), restartDelay);
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    enabled,
    phase,
    index,
    count,
    graphemes,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    restartDelay,
    startDelay,
    loop,
  ]);

  return {
    text: (graphemes[index] ?? []).slice(0, count).join(""),
    index: graphemes[index] ? index : 0,
    phase,
  };
}

function BlinkingCaret({ blinking }: { blinking: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const shouldPulse = blinking && !prefersReducedMotion;

  return (
    <motion.span
      aria-hidden="true"
      className="ml-1 inline-block w-[2px] rounded-full bg-[#C9A227] align-[-0.08em] sm:w-[3px]"
      style={{ height: "0.92em" }}
      initial={false}
      animate={shouldPulse ? { opacity: [1, 0.15, 1] } : { opacity: 1 }}
      transition={
        shouldPulse
          ? { duration: 1.1, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }
          : { duration: 0.2, ease: "easeOut" }
      }
    />
  );
}

const SIZE_CLASSES = {
  sm: "text-[1.05rem] leading-[1.45] sm:text-[1.2rem] lg:text-[1.35rem]",
  md: "text-[1.35rem] leading-[1.45] sm:text-[1.75rem] lg:text-[2.15rem]",
  lg: "text-[1.6rem] leading-[1.4] sm:text-[2.1rem] lg:text-[2.75rem]",
} as const;

export function TypingHero({
  sequences = DEFAULT_TYPING_SEQUENCES,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  restartDelay = 350,
  startDelay = 300,
  loop = true,
  label,
  subtitle,
  showCursor = true,
  align = "center",
  size = "md",
  className,
  textClassName,
  subtitleClassName,
}: TypingHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const lines = React.useMemo(
    () => (sequences.length > 0 ? sequences : DEFAULT_TYPING_SEQUENCES),
    [sequences]
  );

  const reducedMotion = Boolean(prefersReducedMotion);
  const { text: typedText, index: typedIndex, phase } = useTypewriter({
    lines,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    restartDelay,
    startDelay,
    loop,
    enabled: !reducedMotion,
  });

  const isCentered = align === "center";
  const text = reducedMotion ? (lines[0] ?? "") : typedText;
  const activeIndex = reducedMotion ? 0 : typedIndex;
  const isPulsing =
    !reducedMotion && (phase === "pausing" || phase === "waiting" || phase === "idle");

  return (
    <div
      lang="te"
      className={cn(
        "relative w-full bg-[#FDFBF7] text-[#14532D] dark:bg-[#07130c] dark:text-[#EDF5EE]",
        isCentered ? "text-center" : "text-left",
        className
      )}
    >
      {/* Static copy for assistive tech; the animated line is purely decorative. */}
      <p className="sr-only">{lines.join(". ")}</p>

      {label && (
        <div
          className={cn(
            "mb-2.5 flex items-center gap-2",
            isCentered ? "justify-center" : "justify-start"
          )}
        >
          <span aria-hidden="true" className="h-px w-6 bg-[#C9A227]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#C9A227]">
            {label}
          </span>
          <span aria-hidden="true" className="h-px w-6 bg-[#C9A227]" />
        </div>
      )}

      {/*
        Every sequence occupies the same grid cell, so the block reserves the
        height of the tallest line on every breakpoint. No layout shift while
        typing, deleting, or swapping lines.
      */}
      <div
        aria-hidden="true"
        className={cn(
          "grid min-h-[1.5em] items-start font-telugu font-semibold tracking-tight",
          SIZE_CLASSES[size],
          textClassName
        )}
      >
        {lines.map((line, lineIndex) => {
          const isActive = lineIndex === activeIndex;
          return (
            <p
              key={`${lineIndex}-${line}`}
              className={cn(
                "col-start-1 row-start-1 whitespace-pre-wrap",
                isActive ? "visible" : "invisible"
              )}
            >
              <span>{isActive ? text : line}</span>
              {isActive && showCursor && <BlinkingCaret blinking={isPulsing} />}
            </p>
          );
        })}
      </div>

      {subtitle && (
        <p
          className={cn(
            "mt-2.5 max-w-xl font-telugu text-[11px] leading-[1.8] text-[#555555] dark:text-[#A9BCAE] sm:text-xs lg:text-[13px]",
            isCentered && "mx-auto",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}

      <div
        aria-hidden="true"
        className={cn(
          "mt-3 h-px w-16 bg-gradient-to-r from-[#C9A227] to-transparent",
          isCentered && "mx-auto bg-gradient-to-r from-transparent via-[#C9A227] to-transparent"
        )}
      />
    </div>
  );
}

export default TypingHero;
