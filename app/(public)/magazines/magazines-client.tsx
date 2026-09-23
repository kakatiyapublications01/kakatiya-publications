"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Download, FileX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { EditorialHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Magazine } from "@/types";
import dynamic from "next/dynamic";
import { getPublishedMagazines } from "@/lib/firebase/magazines";

const FlipbookReaderModal = dynamic(
  () => import("@/components/flipbook-reader-modal").then((mod) => mod.FlipbookReaderModal),
  { ssr: false }
);

export function MagazinesClient() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMagazine, setActiveMagazine] = useState<Magazine | null>(null);

  useEffect(() => {
    async function fetchMagazines() {
      try {
        setLoading(true);
        const data = await getPublishedMagazines();
        const sorted = [...data].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setMagazines(sorted);
      } catch (err: unknown) {
        console.error("Failed to load magazines:", err);
        setError("Unable to load magazines from the archives at this time.");
      } finally {
        setLoading(false);
      }
    }
    fetchMagazines();
  }, []);

  return (
    <main className="flex-1 py-12 sm:py-16 bg-white">
      <Container size="xl">
        <EditorialHeader
          title="Magazines"
          subtitle="Digital Print Archive"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[3/4] w-full bg-[#F8F7F3] border border-[#E5E5E0]" />
                <div className="h-4 w-1/3 bg-[#E5E5E0]" />
                <div className="h-6 w-3/4 bg-[#E5E5E0]" />
                <div className="h-10 w-full bg-[#E5E5E0]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[#F8F7F3] border border-[#E5E5E0] p-8 max-w-md mx-auto">
            <p className="text-xs uppercase font-bold text-red-700 tracking-wider">{error}</p>
          </div>
        ) : magazines.length === 0 ? (
          <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] p-10 max-w-md mx-auto space-y-3">
            <div className="w-10 h-10 border border-[#C9A227] flex items-center justify-center mx-auto text-[#14532D]">
              <FileX className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#14532D] uppercase tracking-wide">
              No Editions in Archive
            </h3>
            <p className="text-xs text-[#555555]">
              Published print editions will appear here once officially indexed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {magazines.map((mag, i) => (
              <MagazineItem
                key={mag.id || i}
                magazine={mag}
                isLatest={i === 0}
                onOpenReader={(m) => setActiveMagazine(m)}
              />
            ))}
          </div>
        )}
      </Container>

      {/* Interactive Flipbook Reader Modal */}
      <FlipbookReaderModal
        magazine={activeMagazine}
        onClose={() => setActiveMagazine(null)}
      />
    </main>
  );
}

function MagazineItem({
  magazine,
  isLatest,
  onOpenReader,
}: {
  magazine: Magazine;
  isLatest: boolean;
  onOpenReader: (magazine: Magazine) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const pagesCount = magazine.pageCount || magazine.pages || 0;
  const hasCoverImage = Boolean(magazine.coverImageUrl) && !imgError;

  return (
    <div className="flex flex-col justify-between space-y-4">
      {/* Physical Magazine Cover sitting on page */}
      <div
        onClick={() => magazine.pdfUrl && onOpenReader(magazine)}
        className="relative aspect-[3/4] w-full bg-[#F8F7F3] border border-[#E5E5E0] magazine-shadow magazine-shadow-hover cursor-pointer overflow-hidden group"
      >
        {hasCoverImage ? (
          <img
            src={magazine.coverImageUrl}
            alt={magazine.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-6 text-center border-4 border-[#14532D]/10 bg-[#F8F7F3]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-bold">
                KakatiyaPulse
              </p>
              <h3 className="font-serif text-2xl font-black text-[#14532D] mt-2 uppercase">
                {magazine.year || "Archive"}
              </h3>
            </div>
            <p className="font-serif italic text-xs text-[#555555]">
              Official Digital Flipbook Edition
            </p>
            <span className="text-[10px] uppercase font-mono text-[#14532D] border-t border-[#E5E5E0] pt-2">
              Double-Page Spread
            </span>
          </div>
        )}

        {/* Edition Label on Top Left */}
        <div className="absolute top-0 left-0 bg-[#14532D] text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 border-b border-r border-[#C9A227]">
          {isLatest ? "Latest Edition" : `${magazine.year || "Archive"}`}
        </div>
      </div>

      {/* Typography below cover */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#555555]">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#C9A227]">
            {isLatest ? "SPECIAL EDITION" : `ANNUAL ${magazine.year || "ISSUE"}`}
          </span>
          {pagesCount > 0 && (
            <span className="font-mono text-[11px]">{pagesCount} pages</span>
          )}
        </div>

        <h3
          onClick={() => magazine.pdfUrl && onOpenReader(magazine)}
          className="font-serif text-lg font-bold text-[#1C1C1C] hover:text-[#14532D] cursor-pointer transition-colors leading-tight"
        >
          {magazine.title}
        </h3>

        {magazine.description && (
          <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
            {magazine.description}
          </p>
        )}

        <div className="pt-2">
          {magazine.pdfUrl ? (
            <Button
              variant="green"
              size="md"
              className="w-full gap-2 cursor-pointer"
              onClick={() => onOpenReader(magazine)}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Edition</span>
            </Button>
          ) : (
            <Button variant="ghost" disabled className="w-full opacity-50 cursor-not-allowed">
              PDF Unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
