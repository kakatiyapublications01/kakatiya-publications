"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { Magazine, Story } from "@/types";

import { MultiStepLoader } from "@/components/ui/multi-step-loader";

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

export interface SerializableMagazine {
  id: string;
  title: string;
  year: number;
  month?: string;
  pdfUrl: string;
  coverImageUrl: string;
  description: string;
  pageCount?: number;
  pages?: number;
  featured?: boolean;
  status: "published" | "draft" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface SerializableStory {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  date?: string;
}

interface HeroScrollDemoProps {
  magazine?: SerializableMagazine | Magazine | null;
  stories?: SerializableStory[] | Story[];
}

export function HeroScrollDemo({ magazine }: HeroScrollDemoProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fallback magazine data if none passed
  const activeMagazine: Magazine = magazine
    ? {
        ...magazine,
        title: magazine.title || "Legacy, Leadership & Regional Development",
        coverImageUrl: magazine.coverImageUrl || "/images/magazine-cover-2026.webp",
        pageCount: magazine.pageCount || magazine.pages || 64,
        createdAt: magazine.createdAt || new Date().toISOString(),
        updatedAt: magazine.updatedAt || new Date().toISOString(),
      }
    : {
        id: "special-edition-2026",
        title: "Legacy, Leadership & Regional Development",
        year: 2026,
        pdfUrl: "",
        coverImageUrl: "/images/magazine-cover-2026.webp",
        description:
          "Official digital edition documenting the architectural marvels, leadership insights, and distinguished voices of the Kakatiya region.",
        pageCount: 64,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

  const handleOpenReader = () => {
    setLoading(true);
  };

  const handleLoadingComplete = () => {
    setLoading(false);
    if (activeMagazine.pdfUrl) {
      setIsReaderOpen(true);
    } else {
      window.location.href = "/magazines";
    }
  };

  return (
    <div className="flex flex-col overflow-hidden bg-[#FDFBF7]">
      <ContainerScroll
        titleComponent={
          <div className="space-y-3 px-4">
            <div className="inline-flex items-center gap-2">
              <span className="h-[1px] w-6 bg-[#C9A227]" />
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#C9A227]">
                Official Digital Edition
              </span>
              <span className="h-[1px] w-6 bg-[#C9A227]" />
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#14532D] tracking-tight leading-tight max-w-4xl mx-auto">
              Explore the Voice of KakatiyaPulse
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] font-serif italic max-w-xl mx-auto">
              A serious editorial chronicle dedicated to cultural heritage, eminent personalities, and historical documentation.
            </p>
          </div>
        }
      >
        {/* Editorial Broadsheet Layout Spread */}
        <div className="h-full w-full bg-[#FDFBF7] p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 lg:gap-10 overflow-y-auto md:overflow-hidden select-none">
          {/* LEFT COLUMN: 40% Width on Desktop */}
          <div className="w-full md:w-[40%] flex flex-col items-center justify-center shrink-0">
            <div className="relative w-full max-w-[210px] sm:max-w-[240px] md:max-w-[260px] lg:max-w-[280px] aspect-[3/4] bg-white border border-[#E5E0D8] shadow-lg rounded-sm overflow-hidden group">
              <img
                src={activeMagazine.coverImageUrl || "/images/magazine-cover-2026.webp"}
                alt={activeMagazine.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/magazine-hero-cover.webp";
                }}
                draggable={false}
              />
              <div className="absolute top-0 right-0 bg-[#14532D] text-white text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 border-b border-l border-[#C9A227]">
                {activeMagazine.month || "Special Edition"}
              </div>
            </div>

            {/* Subcaption */}
            <p className="mt-3 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#555555] text-center">
              {activeMagazine.month ? `${activeMagazine.month} • ` : ""}Year {activeMagazine.year || 2026} • {activeMagazine.pageCount || 64} Pages
            </p>
          </div>

          {/* RIGHT COLUMN: 60% Width on Desktop */}
          <div className="w-full md:w-[60%] flex flex-col justify-center space-y-4 sm:space-y-5 text-left">
            {/* Category Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#C9A227]">
                  OFFICIAL DIGITAL EDITION
                </span>
                <span className="text-[#C9A227] text-xs">◆</span>
                <span className="text-[11px] font-mono text-[#555555] uppercase">
                  Year {activeMagazine.year || 2026}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14532D] leading-tight">
                {activeMagazine.title}
              </h2>

              <div className="h-[2px] w-14 bg-[#C9A227]" />
            </div>

            {/* Description or Highlights */}
            {activeMagazine.description ? (
              <div className="space-y-2 border-t border-[#E5E0D8] pt-3 sm:pt-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#14532D] font-bold">
                  Editorial Summary
                </p>
                <p className="text-xs sm:text-[13px] text-[#1C1C1C] leading-relaxed whitespace-pre-line font-serif">
                  {activeMagazine.description}
                </p>
              </div>
            ) : (
              <div className="space-y-2 border-t border-[#E5E0D8] pt-3 sm:pt-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#14532D] font-bold">
                  Editorial Highlights
                </p>
                <ul className="space-y-2.5 text-xs sm:text-[13px] text-[#1C1C1C]">
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-[#C9A227] font-bold text-sm leading-none shrink-0 mt-0.5">•</span>
                    <span className="font-medium hover:text-[#14532D] transition-colors">
                      Leadership Insights: Special Feature on Regional Infrastructure
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-[#C9A227] font-bold text-sm leading-none shrink-0 mt-0.5">•</span>
                    <span className="font-medium hover:text-[#14532D] transition-colors">
                      Cultural Heritage: Preserving the Kakatiya Architectural Legacy
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-[#C9A227] font-bold text-sm leading-none shrink-0 mt-0.5">•</span>
                    <span className="font-medium hover:text-[#14532D] transition-colors">
                      Economic Growth: Development Framework for {activeMagazine.year || 2026}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="green"
                size="md"
                className="gap-2 cursor-pointer shadow-sm hover:shadow"
                onClick={handleOpenReader}
              >
                <BookOpen className="w-4 h-4" />
                <span>READ DIGITAL EDITION</span>
              </Button>

              <Link
                href="/magazines"
                className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#14532D] hover:text-[#C9A227] transition-colors py-2 px-3"
              >
                <span>View All Archives</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </ContainerScroll>

      {/* Telugu Multi-Step Loader Overlay */}
      <MultiStepLoader
        loadingStates={magazineLoadingSteps}
        loading={loading}
        duration={1200}
        loop={false}
        onComplete={handleLoadingComplete}
      />

      {/* Interactive Reader Modal */}
      {isReaderOpen && activeMagazine.pdfUrl && (
        <FlipbookReaderModal
          magazine={activeMagazine}
          onClose={() => setIsReaderOpen(false)}
        />
      )}
    </div>
  );
}
