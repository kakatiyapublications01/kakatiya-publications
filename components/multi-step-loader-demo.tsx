"use client";
import React, { useState } from "react";
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { Magazine } from "@/types";

const FlipbookReaderModal = dynamic(
  () => import("@/components/flipbook-reader-modal").then((mod) => mod.FlipbookReaderModal),
  { ssr: false }
);

const magazineLoadingSteps = [
  { text: "కాకతీయ పబ్లికేషన్స్ ప్రత్యేక సంచిక 2026 సిద్ధమవుతోంది..." },
  { text: "ఆంధ్రప్రదేశ్ అభివృద్ధి & ప్రగతి నివేదికలు ప్రాసెస్ అవుతున్నాయి..." },
  { text: "నాయకత్వ విశేషాలు & సంక్షేమ కథనాలు లోడ్ అవుతున్నాయి..." },
  { text: "డిజిటల్ ఫ్లిప్బుక్ వర్షన్ సిద్ధంగా ఉంది!" },
];

interface MultiStepLoaderDemoProps {
  magazine?: Magazine | null;
  onOpenReader?: () => void;
}

export function MultiStepLoaderDemo({ magazine, onOpenReader }: MultiStepLoaderDemoProps) {
  const [loading, setLoading] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const handleOpenMagazine = () => {
    setLoading(true);
  };

  const handleComplete = () => {
    setLoading(false);
    if (onOpenReader) {
      onOpenReader();
    } else if (magazine?.pdfUrl) {
      setIsReaderOpen(true);
    } else {
      window.location.href = "/magazines";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-10 bg-[#FDFBF7] dark:bg-[#0c1e13] rounded-2xl border border-[#E5E0D8] dark:border-emerald-900/40 shadow-sm text-center">
      {/* Step Loader Modal */}
      <Loader
        loadingStates={magazineLoadingSteps}
        loading={loading}
        duration={1200}
        loop={false}
        onComplete={handleComplete}
      />

      {/* Manual Close Button for Demo/Testing */}
      {loading && (
        <button
          className="fixed top-6 right-6 text-gray-800 dark:text-white z-[220] hover:scale-110 transition-transform cursor-pointer"
          onClick={() => setLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10 text-[#14532D] dark:text-[#C9A227]" />
        </button>
      )}

      {/* Updated Telugu Magazine Description */}
      <div className="space-y-4 text-left max-w-2xl mx-auto mb-8 font-serif leading-relaxed text-gray-800 dark:text-gray-200">
        <p className="text-base sm:text-lg border-l-4 border-[#C9A227] pl-4">
          ఆంధ్రప్రదేశ్ అభివృద్ధి, నాయకత్వం, ప్రజా సంక్షేమం మరియు భవిష్యత్ దిశను ఆవిష్కరించే ప్రత్యేక సంచిక.
        </p>
        <p className="text-base sm:text-lg border-l-4 border-[#14532D] pl-4">
          రాష్ట్ర ప్రగతి, పెట్టుబడులు, విద్య, పరిశ్రమలు, సంక్షేమం, గ్రామీణాభివృద్ధి మరియు సమాజ సేవకు అద్దం పట్టే సమగ్ర కథనం.
        </p>
        <p className="text-base sm:text-lg border-l-4 border-[#C9A227] pl-4">
          నాయకత్వం నుంచి అభివృద్ధి వరకు — ఆంధ్రప్రదేశ్ ప్రస్తుత ప్రయాణాన్ని, రేపటి ఆశలను ఒకే వేదికపై అందించే కాకతీయ పబ్లికేషన్స్ ప్రత్యేక సంచిక 2026.
        </p>
      </div>

      {/* View Magazine Button */}
      <button
        onClick={handleOpenMagazine}
        className="w-full sm:w-auto bg-[#14532D] hover:bg-[#0f3d21] text-white font-semibold text-base px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        View Magazine (ప్రత్యేక సంచిక చూడండి)
      </button>

      {/* Reader Modal */}
      {isReaderOpen && magazine && (
        <FlipbookReaderModal
          magazine={magazine}
          onClose={() => setIsReaderOpen(false)}
        />
      )}
    </div>
  );
}

export default MultiStepLoaderDemo;
