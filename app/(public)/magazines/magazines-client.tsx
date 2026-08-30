"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Eye, FileX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        // Sort newest first by publication year and createdAt timestamp
        const sorted = [...data].sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setMagazines(sorted);
      } catch (err: unknown) {
        console.error("Failed to load magazines:", err);
        setError("Unable to load magazines at this time.");
      } finally {
        setLoading(false);
      }
    }
    fetchMagazines();
  }, []);

  return (
    <main className="flex-1 py-16 bg-white">
      <Container size="xl">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <SectionSubtitle>Digital Library</SectionSubtitle>
          <H1 gradient>Magazines Archive</H1>
          <Text className="text-[#555555]">
            Explore our digital collection of high-resolution publications, available for online reading.
          </Text>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-white border border-[#E5E5E0]">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-[#E5E5E0] rounded" />
                    <div className="h-4 w-16 bg-[#E5E5E0] rounded" />
                  </div>
                  <div className="aspect-[3/4] w-full rounded bg-[#F8F7F3]" />
                  <div className="h-6 w-3/4 bg-[#E5E5E0] rounded" />
                  <div className="h-10 w-full bg-[#E5E5E0] rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : magazines.length === 0 ? (
          <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] rounded-2xl p-8 max-w-md mx-auto space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-[#C9A227]/30 flex items-center justify-center mx-auto text-[#C9A227]">
              <FileX className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#14532D]">No Editions Available</h3>
            <p className="text-xs text-[#555555]">
              Published magazine editions will appear here once released.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {magazines.map((mag, i) => (
              <MagazineCard
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

function MagazineCard({
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
    <Card hoverEffect glow={isLatest} className="bg-white border-[#E5E5E0]">
      <CardContent className="p-6 space-y-6 flex flex-col justify-between h-full">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Badge variant={isLatest ? "gold" : "neutral"}>
              {isLatest ? "Latest Edition" : "Archive"}
            </Badge>
            {pagesCount > 0 && (
              <span className="text-xs text-[#555555] font-mono">{pagesCount} Pages</span>
            )}
          </div>

          <div
            onClick={() => magazine.pdfUrl && onOpenReader(magazine)}
            className="relative aspect-[3/4] w-full rounded-md bg-[#F8F7F3] border border-[#E5E5E0] overflow-hidden flex flex-col items-center justify-center p-6 text-center cursor-pointer group shadow-sm"
          >
            {hasCoverImage ? (
              <img
                src={magazine.coverImageUrl}
                alt={magazine.title}
                className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <h3 className="font-serif text-2xl font-bold text-[#14532D] uppercase">
                  {magazine.year ? `${magazine.year} EDITION` : "ANNUAL MAGAZINE"}
                </h3>
                <p className="text-xs text-[#555555] tracking-widest mt-1">YEARLY PUBLICATION</p>
                <span className="text-[10px] text-[#C9A227] border border-[#E8D48A] px-2 py-0.5 rounded mt-4 font-semibold">
                  Digital PDF Edition
                </span>
              </div>
            )}

            {/* Hover overlay with Open Reader CTA */}
            <div className="absolute inset-0 bg-[#14532D]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
              <span className="bg-[#C9A227] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Open Interactive Flipbook
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline gap-2">
              <h3 className="font-serif text-xl font-bold text-[#14532D] line-clamp-2">{magazine.title}</h3>
              <span className="text-xs font-bold text-[#C9A227] font-mono px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E8D48A] shrink-0">
                {magazine.year}
              </span>
            </div>
            <p className="text-xs text-[#555555] mt-1">Official Yearly Publication of KakatiyaPulse</p>
          </div>
        </div>

        {magazine.pdfUrl ? (
          <Button
            variant="green"
            className="w-full cursor-pointer flex items-center justify-center gap-2"
            onClick={() => onOpenReader(magazine)}
          >
            <BookOpen className="w-4 h-4" />
            Read Edition
          </Button>
        ) : (
          <Button variant="ghost" disabled className="w-full opacity-50 cursor-not-allowed">
            PDF Unavailable
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
