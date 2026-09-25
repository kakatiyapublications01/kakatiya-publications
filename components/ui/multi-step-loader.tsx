"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-6 h-6", className)}
  >
    <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const CheckFilled = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("w-6 h-6", className)}
  >
    <path
      fillRule="evenodd"
      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      clipRule="evenodd"
    />
  </svg>
);

type LoadingState = {
  text: string;
};

const LoaderCore = ({
  loadingStates,
  value = 0,
}: {
  loadingStates: LoadingState[];
  value?: number;
}) => {
  return (
    <div className="flex relative justify-start max-w-xl mx-auto flex-col mt-24 sm:mt-40 px-4">
      {loadingStates.map((loadingState, index) => {
        const distance = Math.abs(index - value);
        const opacity = Math.max(1 - distance * 0.25, 0);

        return (
          <motion.div
            key={index}
            className="text-left flex items-start gap-3 mb-4"
            initial={{ opacity: 0, y: -(value * 40) }}
            animate={{ opacity: opacity, y: -(value * 40) }}
            transition={{ duration: 0.5 }}
          >
            <div className="mt-0.5 shrink-0">
              {index > value && (
                <CheckIcon className="text-gray-400 dark:text-gray-500" />
              )}
              {index <= value && (
                <CheckFilled
                  className={cn(
                    "text-emerald-800 dark:text-emerald-400",
                    value === index && "text-[#C9A227] opacity-100 scale-110 transition-transform"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200",
                value === index && "text-[#14532D] dark:text-[#C9A227] font-bold opacity-100"
              )}
            >
              {loadingState.text}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 1500,
  loop = false,
  onComplete,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
  onComplete?: () => void;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }

    if (currentState >= loadingStates.length - 1) {
      const timeout = setTimeout(() => {
        if (loop) {
          setCurrentState(0);
        } else {
          onComplete?.();
        }
      }, duration);

      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCurrentState((prev) => prev + 1);
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full h-full fixed inset-0 z-[9999] flex items-center justify-center bg-[#FDFBF7]/95 dark:bg-[#07130c]/95 backdrop-blur-xl px-4"
        >
          <div className="h-96 relative w-full max-w-lg">
            <LoaderCore value={currentState} loadingStates={loadingStates} />
          </div>
          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-[#FDFBF7] dark:bg-[#07130c] h-full absolute [mask-image:radial-gradient(600px_at_center,transparent_30%,white)] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
