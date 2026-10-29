"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

// ─── Editorial Story Sequence (Each line typed once in strict order) ─────────
const LINE_1 = "KakatiyaPulse";
const LINE_2 = "The Voice of Telugu Excellence";
const LINE_3 = "Stories • Success • Community";
const TYPED_LINES = [LINE_1, LINE_2, LINE_3];

// ─── Human Cadence & Timing (ms) ───────────────────────────────────────────
const SPEED_L1        = 56;   // ms/char for brand name
const SPEED_L2        = 42;   // ms/char for heritage tagline
const SPEED_L3        = 40;   // ms/char for values hallmark
const PAUSE_AFTER_L1  = 440;  // deliberate breathing pause between brand name and tagline
const PAUSE_AFTER_L2  = 400;  // pause before final hallmark
const HOLD_FINAL_MS   = 550;  // appreciation pause on completed letterhead
const UNFOLD_DELAY_MS = 4600; // time when paper unfolds into website hero canvas
const EXIT_START_MS   = 6800; // time when intro completes and merges into homepage
const FADE_OUT_MS     = 600;  // exit fade duration

// ─── Machine Dimensions (520×420 Frame) ───────────────────────────────────
const MACHINE_W          = 520;
const MACHINE_H          = 420;
const PAPER_W            = 330;
const PAPER_L            = 95;
const PAPER_BTM_FROM_TOP = 224;
const PAPER_PEEK         = 70;
const LINE_H             = 25;

const STRIKE_X = 260;
const STRIKE_Y = 222;

// ─── Underwood No. 5 Keyboard Surface Coordinates (3D Perspective Matched) ─
// Calibrated to the authentic Underwood keyboard visible in the photograph
export interface KeyCoordinate {
  x: number;
  y: number;
  w: number;
  h: number;
}

const KEY_COORDINATES: Record<string, KeyCoordinate> = {
  // Row 1 (Q to P) — Y = 323 (slight top perspective tier)
  Q: { x: 174, y: 323, w: 16, h: 12 },
  W: { x: 193, y: 323, w: 16, h: 12 },
  E: { x: 212, y: 323, w: 16, h: 12 },
  R: { x: 231, y: 323, w: 16, h: 12 },
  T: { x: 250, y: 323, w: 16, h: 12 },
  Y: { x: 269, y: 323, w: 16, h: 12 },
  U: { x: 288, y: 323, w: 16, h: 12 },
  I: { x: 307, y: 323, w: 16, h: 12 },
  O: { x: 326, y: 323, w: 16, h: 12 },
  P: { x: 345, y: 323, w: 16, h: 12 },

  // Row 2 (A to L) — Y = 339 (middle tier)
  A: { x: 182, y: 339, w: 16, h: 12 },
  S: { x: 201, y: 339, w: 16, h: 12 },
  D: { x: 220, y: 339, w: 16, h: 12 },
  F: { x: 239, y: 339, w: 16, h: 12 },
  G: { x: 258, y: 339, w: 16, h: 12 },
  H: { x: 277, y: 339, w: 16, h: 12 },
  J: { x: 296, y: 339, w: 16, h: 12 },
  K: { x: 315, y: 339, w: 16, h: 12 },
  L: { x: 334, y: 339, w: 16, h: 12 },

  // Row 3 (Z to M) — Y = 356 (front tier)
  Z: { x: 194, y: 356, w: 17, h: 13 },
  X: { x: 214, y: 356, w: 17, h: 13 },
  C: { x: 234, y: 356, w: 17, h: 13 },
  V: { x: 254, y: 356, w: 17, h: 13 },
  B: { x: 274, y: 356, w: 17, h: 13 },
  N: { x: 294, y: 356, w: 17, h: 13 },
  M: { x: 314, y: 356, w: 17, h: 13 },

  // Spacebar — Y = 374 (front plinth bar)
  " ": { x: 260, y: 374, w: 136, h: 8 },
};

// ─── Real Mechanical Web Audio Synthesizer (Zero TTS, zero voice) ───────────
class TypewriterSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = false;

  public initOrResume() {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
  }

  public toggle(): boolean {
    if (!this.enabled) {
      this.initOrResume();
      return this.enabled;
    } else {
      this.enabled = false;
      return false;
    }
  }

  public playKey(isSpace: boolean) {
    if (!this.enabled || !this.ctx) return;
    try {
      const ctx = this.ctx;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const now = ctx.currentTime;

      // 1. Metal key impact click (filtered noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.015);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.26));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = isSpace ? "lowpass" : "bandpass";
      filter.frequency.value = isSpace ? 750 : 2500;
      filter.Q.value = 2.4;

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(isSpace ? 0.022 : 0.035, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      noise.connect(filter);
      filter.connect(clickGain);
      clickGain.connect(ctx.destination);
      noise.start(now);

      // 2. Cast-iron keybed acoustic impulse
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(isSpace ? 95 : 140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.03);

      oscGain.gain.setValueAtTime(isSpace ? 0.026 : 0.02, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  public playCarriageReturn() {
    if (!this.enabled || !this.ctx) return;
    try {
      const ctx = this.ctx;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const now = ctx.currentTime;

      // Authentic vintage brass bell ping (dual sine harmonics)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const bellGain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1760, now);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(3520, now);

      bellGain.gain.setValueAtTime(0.045, now);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc1.connect(bellGain);
      osc2.connect(bellGain);
      bellGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);

      // Platen ratchet gear sound
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const pulse = Math.sin((i / bufferSize) * Math.PI * 12);
        data[i] = (Math.random() * 2 - 1) * Math.abs(pulse) * Math.exp(-i / (bufferSize * 0.35));
      }
      const ratchet = ctx.createBufferSource();
      ratchet.buffer = buffer;
      const rFilter = ctx.createBiquadFilter();
      rFilter.type = "bandpass";
      rFilter.frequency.value = 1650;
      rFilter.Q.value = 1.8;

      const rGain = ctx.createGain();
      rGain.gain.setValueAtTime(0.015, now);
      rGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      ratchet.connect(rFilter);
      rFilter.connect(rGain);
      rGain.connect(ctx.destination);
      ratchet.start(now + 0.03);
    } catch {}
  }

  public dispose() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }
    this.enabled = false;
  }
}

// ─── Main IntroPreloader Component ───────────────────────────────────────────
export function IntroPreloader({ onDone }: { onDone?: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"typing" | "unfold" | "exiting">("typing");
  const [scale, setScale] = useState(1);
  const [soundActive, setSoundActive] = useState(false);

  // Dedicated single-source typing state
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [activeKey, setActiveKey] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [carriageStep, setCarriageStep] = useState(0);

  const audioRef = useRef<TypewriterSoundEngine | null>(null);
  const dismissedRef = useRef(false);
  const runIdRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  // ── Session & Dev Check (Immediate display on first visit, zero blank screen) ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    audioRef.current = new TypewriterSoundEngine();

    const checkTimer = setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const forceReplay =
        searchParams.get("intro") === "replay" ||
        searchParams.get("replay") === "1" ||
        searchParams.get("intro") === "1";

      const alreadySeen = sessionStorage.getItem("kp_intro_seen");

      if (forceReplay || !alreadySeen) {
        setVisible(true);
      }
    }, 0);

    return () => {
      clearTimeout(checkTimer);
      audioRef.current?.dispose();
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // ── Clean dismiss handler ──
  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    try {
      sessionStorage.setItem("kp_intro_seen", "1");
    } catch {}

    setPhase("exiting");
    clearAllTimeouts();
    audioRef.current?.dispose();

    safeTimeout(() => {
      setVisible(false);
      onDone?.();
    }, FADE_OUT_MS);
  }, [clearAllTimeouts, onDone, safeTimeout]);

  // ── ESC key listener ──
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, handleDismiss]);

  // ── Universal Responsive Scaler (320px, 375px, 390px, 430px, iPad, Desktop) ──
  useEffect(() => {
    if (!visible) return;
    function measure() {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Available bounding dimensions with safe margins
      const availableW = Math.max(260, vw - 20);
      const availableH = Math.max(320, vh - 100);

      const scaleW = availableW / MACHINE_W;
      const scaleH = availableH / MACHINE_H;

      // Fit gracefully within both width and height, capped at 1.02
      const computedScale = Math.min(scaleW, scaleH, 1.02);
      setScale(Math.max(0.46, computedScale));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible]);

  // ── Audio Toggle (Strictly user-opt-in, zero TTS) ──
  const toggleSound = useCallback(() => {
    if (!audioRef.current) return;
    const nowEnabled = audioRef.current.toggle();
    setSoundActive(nowEnabled);
  }, []);

  // ── Strict Single-Run Typing Orchestrator ──
  useEffect(() => {
    if (!visible) return;

    runIdRef.current += 1;
    const currentRun = runIdRef.current;

    if (shouldReduceMotion) {
      // Reduced motion: show serene completed letterhead, then smoothly merge into homepage
      safeTimeout(() => {
        if (currentRun !== runIdRef.current) return;
        setTypedLines([LINE_1, LINE_2, LINE_3]);
        setCurrentText("");
        setPhase("unfold");
        safeTimeout(handleDismiss, 2000);
      }, 0);
      return;
    }

    let lineIdx = 0;
    let charIdx = 0;

    const startTyping = () => {
      if (currentRun !== runIdRef.current) return;
      setTypedLines([]);
      setCurrentText("");
      setCurrentLineIndex(0);
      setCarriageStep(0);

      const targetText = TYPED_LINES[lineIdx];
      const baseSpeed =
        lineIdx === 0 ? SPEED_L1 : lineIdx === 1 ? SPEED_L2 : SPEED_L3;

      const typeNextChar = () => {
        if (currentRun !== runIdRef.current) return;

        if (charIdx < targetText.length) {
          const char = targetText[charIdx];
          const isSpace = char === " ";

          // Natural human variance (micro cadence fluctuation)
          const variance = Math.sin(charIdx * 2.5) * 8;
          const charDelay = isSpace ? baseSpeed + 35 : Math.max(28, baseSpeed + variance);

          audioRef.current?.playKey(isSpace);

          setCurrentText(targetText.slice(0, charIdx + 1));
          setCurrentLineIndex(lineIdx);
          setActiveKey(char.toUpperCase());
          setCharCount(prev => prev + 1);
          setCarriageStep(prev => prev + 1.8);
          charIdx++;

          safeTimeout(typeNextChar, charDelay);
        } else {
          // Line finished typing!
          const pauseBeforeNext =
            lineIdx === 0
              ? PAUSE_AFTER_L1
              : lineIdx === 1
              ? PAUSE_AFTER_L2
              : HOLD_FINAL_MS;

          if (lineIdx < TYPED_LINES.length - 1) {
            audioRef.current?.playCarriageReturn();

            safeTimeout(() => {
              if (currentRun !== runIdRef.current) return;
              setTypedLines(prev => [...prev, targetText]);
              setCurrentText("");
              setCarriageStep(0); // Carriage returns to margin
              lineIdx++;
              charIdx = 0;
              setCurrentLineIndex(lineIdx);
              setActiveKey("RETURN");
              safeTimeout(typeNextChar, 220);
            }, pauseBeforeNext);
          } else {
            // All 3 lines completed!
            safeTimeout(() => {
              if (currentRun !== runIdRef.current) return;
              setTypedLines(prev => [...prev, targetText]);
              setCurrentText("");
              setActiveKey("");
            }, 120);
          }
        }
      };

      safeTimeout(typeNextChar, 260);
    };

    startTyping();

    // Cinematic Unfold: Paper blossoms into the website hero canvas
    safeTimeout(() => {
      if (currentRun === runIdRef.current) setPhase("unfold");
    }, UNFOLD_DELAY_MS);

    // Seamless exit into live homepage
    safeTimeout(() => {
      if (currentRun === runIdRef.current) handleDismiss();
    }, EXIT_START_MS);

    return () => {
      runIdRef.current += 1;
    };
  }, [visible, shouldReduceMotion, handleDismiss, safeTimeout]);

  // Dev replay trigger
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { replayKakatiyaIntro?: () => void }).replayKakatiyaIntro = () => {
        sessionStorage.removeItem("kp_intro_seen");
        dismissedRef.current = false;
        setTypedLines([]);
        setCurrentText("");
        setCurrentLineIndex(0);
        setCarriageStep(0);
        setPhase("typing");
        setVisible(true);
      };
    }
  }, []);

  if (!visible) {
    if (process.env.NODE_ENV !== "production") {
      return (
        <button
          onClick={() => {
            sessionStorage.removeItem("kp_intro_seen");
            dismissedRef.current = false;
            setTypedLines([]);
            setCurrentText("");
            setCurrentLineIndex(0);
            setCarriageStep(0);
            setPhase("typing");
            setVisible(true);
          }}
          className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-[#14532D]/90 text-[#FDFBF7] text-[11px] font-sans font-medium rounded-full shadow-lg border border-[#C9A227]/40 hover:bg-[#14532D] hover:scale-105 transition-all cursor-pointer opacity-75 hover:opacity-100"
          title="Replay intro animation (Dev only)"
          aria-label="Replay Intro"
        >
          <RotateCcw className="w-3 h-3 text-[#C9A227]" />
          <span>Replay Intro</span>
        </button>
      );
    }
    return null;
  }

  const isUnfolding = phase === "unfold";
  const activeCoord = KEY_COORDINATES[activeKey];

  return (
    <AnimatePresence>
      {visible && phase !== "exiting" && (
        <motion.div
          key="kakatiya-editorial-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.01,
            transition: { type: "tween", duration: FADE_OUT_MS / 1000, ease: [0.4, 0, 0.2, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden select-none px-2 sm:px-4"
          style={{
            background: isUnfolding
              ? "radial-gradient(ellipse at 50% 30%, #F8F7F3 0%, #FFFFFF 60%, #FAF8F5 100%)"
              : "#FDFBF7",
            transition: "background 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="KakatiyaPulse Cinematic Intro"
        >
          {/* ── Sepia Warm Desk Vignette ── */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
              opacity: isUnfolding ? 0.08 : 0.85,
              background:
                "radial-gradient(circle at 50% 42%, rgba(245, 230, 200, 0.42) 0%, rgba(220, 200, 168, 0.18) 60%, rgba(55, 38, 14, 0.12) 100%)",
            }}
          />

          {/* Micro Cotton Paper Grain */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              opacity: isUnfolding ? 0.015 : 0.035,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
              backgroundSize: "256px 256px",
            }}
          />

          {/* ── Warm Gold Light Sweep (Editorial Beam) ── */}
          <AnimatePresence>
            {isUnfolding && (
              <motion.div
                key="editorial-gold-sweep"
                initial={{ x: "-120%", opacity: 0 }}
                animate={{ x: "130%", opacity: [0, 0.9, 1, 0.8, 0] }}
                transition={{ type: "tween", duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-y-0 w-[140%] pointer-events-none z-30"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 20%, rgba(201,162,39,0.18) 38%, rgba(255,230,140,0.75) 48%, rgba(255,255,255,0.95) 50%, rgba(255,230,140,0.75) 52%, rgba(201,162,39,0.18) 62%, transparent 80%)",
                  filter: "blur(8px)",
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Mobile-Optimized Top Bar Controls (min 44px tap target) ── */}
          <header className="absolute top-3 sm:top-6 left-0 right-0 px-3 sm:px-8 flex items-center justify-between z-40">
            {/* Audio Toggle (Strictly user-opt-in, zero TTS) */}
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "tween", duration: 0.3, delay: 0.15 }}
              onClick={toggleSound}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-mono font-medium transition-all cursor-pointer backdrop-blur-md min-h-[40px] touch-manipulation ${
                isUnfolding
                  ? "bg-[#14532D]/10 text-[#14532D] border border-[#14532D]/20 hover:bg-[#14532D]/20 active:scale-95"
                  : "bg-black/5 text-[#14532D] border border-[#14532D]/20 hover:bg-black/10 active:scale-95"
              }`}
              aria-label={soundActive ? "Mute mechanical sounds" : "Enable mechanical typing sounds"}
            >
              {soundActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
                  <span className="inline">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 opacity-60" />
                  <span className="inline opacity-75">Muted</span>
                </>
              )}
            </motion.button>

            {/* Skip Intro Button */}
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "tween", duration: 0.3, delay: 0.2 }}
              onClick={handleDismiss}
              className={`group flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-sans uppercase tracking-[0.14em] font-bold transition-all cursor-pointer backdrop-blur-md min-h-[40px] touch-manipulation ${
                isUnfolding
                  ? "bg-[#14532D] text-[#FDFBF7] hover:bg-[#0F381E] shadow-sm active:scale-95"
                  : "bg-[#14532D] text-[#FDFBF7] hover:bg-[#0F381E] shadow-sm active:scale-95"
              }`}
              aria-label="Skip intro animation and enter website"
            >
              <span>Skip Intro</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </motion.button>
          </header>

          {/* ══════════════════════════════════════════════════════════════════
              CENTRAL CANVAS: VINTAGE TYPEWRITER & CONTINUOUS UNFOLDING HERO
             ══════════════════════════════════════════════════════════════════ */}
          <div
            className="relative flex flex-col items-center justify-center w-full max-w-full"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {/* ── STAGE A: THE TYPEWRITER HARDWARE ── */}
            <motion.div
              animate={
                isUnfolding
                  ? { y: 280, opacity: 0, scale: 0.94 }
                  : { y: 0, opacity: 1, scale: 1 }
              }
              transition={{ type: "tween", duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex-shrink-0"
              style={{ width: MACHINE_W, height: MACHINE_H }}
            >
              {/* Neutral Top Badge (Zero brand repetition) */}
              <div className="absolute -top-10 left-0 right-0 text-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-[0.34em] text-[#C9A227] font-semibold">
                  Heritage Edition • 2026
                </span>
                <div className="w-8 h-[1px] bg-[#C9A227]/60 mx-auto mt-1" />
              </div>

              {/* Moving Carriage Assembly: shifts horizontally as each key strikes */}
              <motion.div
                className="absolute overflow-hidden"
                style={{
                  left: PAPER_L,
                  width: PAPER_W,
                  bottom: MACHINE_H - PAPER_BTM_FROM_TOP,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
                animate={{
                  top: -(PAPER_PEEK + typedLines.length * LINE_H + (currentText.length > 0 ? 12 : 0) + 38),
                  x: -carriageStep,
                }}
                transition={{
                  top: { type: "spring", stiffness: 180, damping: 24 },
                  x: { type: "tween", duration: 0.08, ease: "easeOut" },
                }}
              >
                {/* Vintage Cream Paper Sheet with Cotton Laid Texture */}
                <div
                  className="relative w-full p-4 sm:p-5 pt-3 pb-7 bg-[#FCFAF4] border border-[#E7E2D6] rounded-t-sm"
                  style={{
                    minHeight: 200,
                    boxShadow:
                      "0 0 0 1px rgba(0,0,0,0.06), 0 4px 18px rgba(0,0,0,0.12), 0 0 28px rgba(201,162,39,0.14)",
                  }}
                >
                  {/* Faint blue guide rules */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 h-px bg-[rgba(100,130,220,0.07)]"
                      style={{ top: 36 + i * LINE_H }}
                    />
                  ))}

                  {/* Red margin guideline */}
                  <div className="absolute top-0 bottom-0 left-6 sm:left-7 w-px bg-[rgba(220,50,50,0.2)]" />

                  {/* Letterhead (Telugu Heritage Journal — ZERO 'KakatiyaPulse' duplicate) */}
                  <div className="ml-4 sm:ml-5 font-serif text-[7.5px] uppercase tracking-[0.24em] font-bold text-[#14532D] pb-1.5 mb-2.5 border-b border-[#C9A227]/40 flex items-center justify-between">
                    <span>Journal of Telugu Leadership</span>
                    <span className="text-[6.5px] text-[#C9A227]">EST. 2024</span>
                  </div>

                  {/* ── The 3 Editorial Lines (Strictly One Occurrence Each) ── */}
                  <div className="ml-4 sm:ml-5 space-y-1.5">
                    {/* Line 1: KakatiyaPulse (Sole Occurrence — Proud Hero Heading) */}
                    <div className="min-h-[26px]">
                      {(currentLineIndex === 0 ? currentText : typedLines[0]) && (
                        <h2 className="font-serif text-[18px] sm:text-[20px] font-black tracking-[0.06em] uppercase text-[#14532D] leading-none drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.25)]">
                          {currentLineIndex === 0 ? currentText : typedLines[0]}
                          {currentLineIndex === 0 && (
                            <span className="inline-block w-2 h-4 bg-[#C9A227] ml-1 translate-y-0.5 animate-pulse" />
                          )}
                        </h2>
                      )}
                    </div>

                    {/* Line 2: The Voice of Telugu Excellence (Editorial Subtitle) */}
                    <div className="min-h-[20px]">
                      {(currentLineIndex === 1 ? currentText : typedLines[1]) && (
                        <p className="font-serif italic text-[11.5px] sm:text-[13px] text-[#222222] tracking-wide leading-snug drop-shadow-[0_0.3px_0.3px_rgba(0,0,0,0.2)]">
                          &ldquo;{currentLineIndex === 1 ? currentText : typedLines[1]}&rdquo;
                          {currentLineIndex === 1 && (
                            <span className="inline-block w-1.5 h-3.5 bg-[#C9A227] ml-1 translate-y-0.5 animate-pulse" />
                          )}
                        </p>
                      )}
                    </div>

                    {/* Line 3: Stories • Success • Community (Refined Hallmark) */}
                    <div className="min-h-[18px]">
                      {(currentLineIndex === 2 ? currentText : typedLines[2]) && (
                        <p className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.22em] font-bold text-[#C9A227] pt-0.5">
                          {currentLineIndex === 2 ? currentText : typedLines[2]}
                          {currentLineIndex === 2 && (
                            <span className="inline-block w-1.5 h-3 bg-[#14532D] ml-1 translate-y-0.5 animate-pulse" />
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Typewriter Photo (The authentic Underwood keyboard is 100% visible here, with NO fake circular key duplicates) */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 2,
                  mixBlendMode: "multiply",
                }}
              >
                <Image
                  src="/assets/typewriter.png"
                  alt="Vintage Underwood Typewriter"
                  fill
                  className="object-contain object-bottom select-none pointer-events-none"
                  style={{ filter: "contrast(1.03) brightness(1.01)" }}
                  priority
                  draggable={false}
                />
              </div>

              {/* Mechanical Typebar Hammer Strike Simulation */}
              {activeKey && activeKey !== "RETURN" && activeKey !== " " && (
                <div
                  key={`typebar_${charCount}`}
                  className="absolute inset-0 pointer-events-none z-[3]"
                  aria-hidden
                >
                  <svg
                    width={MACHINE_W}
                    height={MACHINE_H}
                    viewBox={`0 0 ${MACHINE_W} ${MACHINE_H}`}
                    className="absolute inset-0"
                  >
                    <motion.line
                      x1={activeCoord ? activeCoord.x : STRIKE_X}
                      y1={270}
                      x2={STRIKE_X}
                      y2={STRIKE_Y}
                      stroke="#C9A227"
                      strokeWidth={2}
                      strokeLinecap="round"
                      initial={{ opacity: 0, pathLength: 0.2 }}
                      animate={{ opacity: [0, 1, 0], pathLength: [0.2, 1, 0.2] }}
                      transition={{ type: "tween", duration: 0.08 }}
                    />
                    <motion.circle
                      cx={STRIKE_X}
                      cy={STRIKE_Y}
                      r={4.5}
                      fill="#D4AF37"
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: [0.5, 2.2, 0], opacity: [1, 0.8, 0] }}
                      transition={{ type: "tween", duration: 0.1 }}
                    />
                  </svg>
                </div>
              )}

              {/* ── Single Active Keypress Feedback ──
                  Only highlights and depresses the SINGLE active key when struck.
                  Zero duplicate keys! Zero floating black circles over the real keyboard! */}
              {activeKey && activeCoord && (
                <div
                  key={`active_key_${charCount}`}
                  className="absolute pointer-events-none z-[4]"
                  style={{
                    left: activeCoord.x - activeCoord.w / 2,
                    top: activeCoord.y - activeCoord.h / 2,
                    width: activeCoord.w,
                    height: activeCoord.h,
                  }}
                  aria-hidden
                >
                  <motion.div
                    initial={{ y: 0, opacity: 0.85, scale: 1 }}
                    animate={{ y: [0, 2.5, 0], opacity: [0.85, 1, 0] }}
                    transition={{ type: "tween", duration: 0.09, ease: "easeOut" }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: activeKey === " " ? 2 : "50%",
                      border: "1.5px solid rgba(201, 162, 39, 0.9)",
                      boxShadow: "0 0 8px rgba(201, 162, 39, 0.85), inset 0 0 3px rgba(255, 255, 255, 0.7)",
                      background: activeKey === " "
                        ? "rgba(201, 162, 39, 0.25)"
                        : "radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%)",
                    }}
                  />
                </div>
              )}
            </motion.div>

            {/* ── STAGE B: THE PAPER UNFOLDS INTO THE WEBSITE HERO CANVAS ──
                Mobile-optimized responsive card (scales cleanly on 320px–430px) */}
            {isUnfolding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "tween", duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-2 sm:inset-x-8 max-w-2xl mx-auto p-5 sm:p-9 bg-white rounded-md border border-[#E5E5E0] shadow-2xl flex flex-col items-center text-center z-30"
              >
                {/* Royal Emblem with Gold Halo */}
                <div className="relative mb-3 sm:mb-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.25, 1], opacity: [0, 0.45, 0.2] }}
                    transition={{ type: "tween", duration: 1.2, ease: "easeOut" }}
                    className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#C9A227] via-[#F59E0B] to-[#C9A227] blur-xl opacity-20 pointer-events-none"
                  />
                  <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full p-2 bg-[#0A2E1A] border-2 border-[#C9A227] shadow-xl flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="KakatiyaPulse Emblem"
                      width={64}
                      height={64}
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Subtitle Dateline */}
                <span className="text-[9.5px] sm:text-xs uppercase tracking-[0.3em] text-[#C9A227] font-semibold font-sans mb-1">
                  Official Digital Edition • Special Issue
                </span>

                {/* Grand Masthead: KakatiyaPulse */}
                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.06em] uppercase text-[#14532D] leading-none">
                  KakatiyaPulse
                </h1>

                {/* Gold Filigree Divider */}
                <div className="w-40 sm:w-56 h-[1.5px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent my-3 sm:my-3.5" />

                {/* Tagline: Stories • Success • Community */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-sm font-sans tracking-[0.2em] uppercase text-[#14532D] font-bold">
                  <span>Stories</span>
                  <span className="text-[#C9A227] text-xs">✦</span>
                  <span>Success</span>
                  <span className="text-[#C9A227] text-xs">✦</span>
                  <span>Community</span>
                </div>

                {/* Secondary Tagline */}
                <p className="font-serif italic text-xs sm:text-sm text-[#555555] mt-2">
                  &ldquo;The Voice of Telugu Excellence&rdquo;
                </p>

                {/* Editorial Dateline Strip */}
                <div className="mt-4 pt-2.5 border-t border-[#E5E5E0] w-full flex items-center justify-center gap-2.5 text-[10.5px] text-[#555555] font-serif italic">
                  <span>Journal of Leadership & Culture</span>
                  <span>•</span>
                  <span>Volume IV • 2026</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Editorial Progress Bar ── */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 z-40 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ type: "tween", duration: EXIT_START_MS / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-[#14532D] via-[#C9A227] to-[#F59E0B]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IntroPreloader;
