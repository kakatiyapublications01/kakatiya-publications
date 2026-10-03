"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BellRing,
  Calendar,
  Sparkles,
  ExternalLink,
  ZoomIn,
  X,
  Share2,
  Check,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { Announcement } from "@/types";

interface TeluguAnnouncementsProps {
  announcements?: Announcement[];
  className?: string;
}

export function TeluguAnnouncements({
  announcements = [],
  className = "",
}: TeluguAnnouncementsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // If no announcements passed, or empty list
  if (!announcements || announcements.length === 0) {
    return null;
  }

  const handleShare = async (item: Announcement) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${item.title}\n\n${item.content}\n\n- కాకతీయ పల్స్ (KakatiyaPulse)`);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("te-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return dateString;
    }
  };

  return (
    <section className={`relative py-12 sm:py-16 bg-[#FDFCF7] border-y border-[#E5E5E0] overflow-hidden ${className}`}>
      {/* Decorative Subtle Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#14532D]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 border-b border-[#E5E5E0] pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532D]/10 text-[#14532D] text-xs font-semibold tracking-wide mb-3 border border-[#14532D]/20">
              <Megaphone className="w-3.5 h-3.5 text-[#C9A227] animate-pulse" />
              <span>ప్రత్యేక ప్రకటనలు &bull; Official Announcements</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black text-[#14532D] tracking-tight">
              తాజా వార్తలు &amp; ముఖ్య సమాచారం
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] mt-1 font-sans">
              కాకతీయ పల్స్ పాఠకుల కోసం అధికారిక ప్రెస్ నోట్స్, ప్రకటనలు మరియు తాజా అప్‌డేట్స్
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#555555]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>లైవ్ అప్‌డేట్స్ ({announcements.length})</span>
          </div>
        </div>

        {/* Announcements Grid / Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {announcements.map((item, index) => {
            const isFirst = index === 0;
            const isExpanded = expandedId === item.id;
            const isLong = item.content.length > 220;
            const displayContent = isLong && !isExpanded
              ? item.content.slice(0, 220) + "..."
              : item.content;

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group relative flex flex-col justify-between rounded-xl bg-white border border-[#E5E5E0] transition-all duration-300 hover:shadow-xl hover:border-[#14532D]/40 hover:-translate-y-1 overflow-hidden ${
                  isFirst ? "md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-[#F9F8F3]" : ""
                }`}
              >
                {/* Glowing Top Border Highlight */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#14532D] via-[#C9A227] to-[#14532D] opacity-90 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Top Meta Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#14532D] bg-[#14532D]/5 px-2.5 py-1 rounded-md border border-[#14532D]/15">
                      <Sparkles className="w-3 h-3 text-[#C9A227]" />
                      ప్రకటన #{index + 1}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-[#666666]">
                      {item.createdAt && (
                        <span className="flex items-center gap-1 font-sans">
                          <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                          {formatDate(item.createdAt)}
                        </span>
                      )}
                      <button
                        onClick={() => handleShare(item)}
                        title="సమాచారం కాపీ చేయండి"
                        className="p-1.5 rounded-md hover:bg-[#F3F2EC] text-[#555555] hover:text-[#14532D] transition-colors"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Optional Image */}
                  {item.imageUrl && (
                    <div
                      onClick={() => setSelectedImage(item.imageUrl || null)}
                      className="group/img relative mb-5 rounded-lg overflow-hidden border border-[#E5E5E0] bg-[#F8F7F3] cursor-pointer aspect-video"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-semibold text-[#14532D] flex items-center gap-1.5 shadow-md">
                          <ZoomIn className="w-3.5 h-3.5" /> క్లిక్ చేసి పెద్దదిగా చూడండి
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title in Telugu Typography */}
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14532D] leading-snug tracking-normal mb-3 group-hover:text-[#166534] transition-colors">
                    {item.title}
                  </h3>

                  {/* Content in Telugu Typography */}
                  <div className="text-sm sm:text-base text-[#2C2C2C] leading-relaxed font-sans whitespace-pre-line flex-1">
                    {displayContent}
                  </div>

                  {isLong && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="mt-3 text-xs font-bold text-[#C9A227] hover:text-[#14532D] flex items-center gap-1 self-start transition-colors"
                    >
                      {isExpanded ? "తక్కువగా చూపించు (Show less)" : "మరింత చదవండి (Read more)..."}
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  )}
                </div>

                {/* Footer Signature */}
                <div className="px-6 py-3 bg-[#FAF9F5] border-t border-[#E5E5E0] flex items-center justify-between text-[11px] text-[#666666]">
                  <span className="font-medium">
                    {item.authorName ? `ప్రచురణ: ${item.authorName}` : "కాకతీయ పల్స్ ఎడిటోరియల్ టీమ్"}
                  </span>
                  <span className="text-[#C9A227] font-semibold flex items-center gap-1">
                    అధికారిక ప్రకటన
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Image Zoom */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl border border-white/20"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
                title="మూసివేయి (Close)"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedImage}
                alt="Announcement Image Full View"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
