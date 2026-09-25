"use client";
import React, { useState, useEffect } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion, AnimatePresence } from "motion/react";

interface IntroSplashProps {
  onComplete?: () => void;
  autoDismissMs?: number;
}

export function KakatiyaPulseSplash({
  onComplete,
  autoDismissMs = 2800,
}: IntroSplashProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      dismissSplash();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  const dismissSplash = () => {
    setIsVisible(false);
    if (onComplete) {
      setTimeout(onComplete, 800); // Wait for fade-out animation
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07130c] overflow-hidden px-4"
        >
          {/* Particle Background */}
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="kakatiya-pulse-particles"
              background="transparent"
              minSize={0.6}
              maxSize={1.6}
              particleDensity={80}
              className="w-full h-full"
              particleColor="#C9A227" // Restrained Gold Particles
            />
          </div>

          {/* Center Brand Identity */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#C9A227] uppercase"
            >
              Official Digital Edition
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#FDFBF7] tracking-tight leading-none"
            >
              KakatiyaPulse
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm sm:text-base text-emerald-100/70 font-sans italic max-w-md"
            >
              A serious editorial chronicle dedicated to cultural heritage, eminent personalities, and historical documentation.
            </motion.p>

            {/* Quick Skip / Enter Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              onClick={dismissSplash}
              className="mt-6 px-6 py-2 border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors cursor-pointer"
            >
              Enter Website
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default KakatiyaPulseSplash;
