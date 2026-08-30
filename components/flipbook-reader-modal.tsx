"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Loader2,
  LayoutGrid,
  Share2,
  List,
  Check,
} from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Magazine } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FlipbookReaderModalProps {
  magazine: Magazine | null;
  onClose: () => void;
}

export function FlipbookReaderModal({ magazine, onClose }: FlipbookReaderModalProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [pageFlipping, setPageFlipping] = useState<"next" | "prev" | null>(null);

  // New UI feature states
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [pageInputText, setPageInputText] = useState<string>("1");
  const [isEditingPage, setIsEditingPage] = useState<boolean>(false);

  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskLeftRef = useRef<any>(null);
  const renderTaskRightRef = useRef<any>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Format display string e.g. "10-11" or "1"
  const getPageDisplayString = useCallback((page: number, total: number, mobile: boolean) => {
    if (mobile || page === 1 || total <= 1) {
      return `${page}`;
    }
    const left = page % 2 === 0 ? page : page - 1;
    const right = Math.min(left + 1, total);
    return left === right ? `${left}` : `${left}-${right}`;
  }, []);

  // Update page input text when current page changes
  useEffect(() => {
    if (!isEditingPage && numPages > 0) {
      setPageInputText(getPageDisplayString(currentPage, numPages, isMobile));
    }
  }, [currentPage, numPages, isMobile, isEditingPage, getPageDisplayString]);

  // Handle responsive layout detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard navigation & ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showThumbnails) {
          setShowThumbnails(false);
        } else if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "ArrowRight") {
        nextPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages, isMobile, showThumbnails]);

  // Load PDF document from URL
  useEffect(() => {
    if (!magazine || !magazine.pdfUrl) return;

    let isSubscribed = true;
    let loadingTask: any = null;

    setLoading(true);
    setLoadingProgress(10);
    setError(null);
    setCurrentPage(1);

    const pdfUrl = magazine.pdfUrl;
    console.log("[FlipbookReader] Loading PDF from URL:", pdfUrl);

    async function initPdf() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs`;

        const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;

        // Strategy A (Instant Range Stream): PDF.js fetches only ~64KB header to render Page 1 in < 500ms
        try {
          console.log("[FlipbookReader] Fast range stream via proxy:", proxyUrl);
          setLoadingProgress(40);

          loadingTask = pdfjsLib.getDocument({
            url: proxyUrl,
            cMapUrl: `/pdfjs/cmaps/`,
            cMapPacked: true,
            disableAutoFetch: true,
            disableStream: false,
          });

          const doc = await loadingTask.promise;
          if (isSubscribed) {
            setPdfDoc(doc);
            setNumPages(doc.numPages);
            setLoadingProgress(100);
            setLoading(false);
            return;
          }
        } catch (rangeErr) {
          console.warn("[FlipbookReader] Range stream warning, trying direct ArrayBuffer fetch:", rangeErr);
        }

        // Strategy B (Fallback ArrayBuffer): Download complete buffer if range stream fails
        if (!isSubscribed) return;
        setLoadingProgress(60);

        const proxyResponse = await fetch(proxyUrl);
        if (!proxyResponse.ok) {
          throw new Error(`Failed to load PDF (HTTP ${proxyResponse.status})`);
        }

        const arrayBuffer = await proxyResponse.arrayBuffer();
        if (!isSubscribed) return;

        setLoadingProgress(95);
        loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: `/pdfjs/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isSubscribed) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoadingProgress(100);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("[FlipbookReader] PDF loading error:", err?.name, err?.message, err);
        if (isSubscribed) {
          setError(`Unable to open this edition. (${err?.message || err?.name || "Unknown error"})`);
          setLoading(false);
        }
      }
    }

    initPdf();

    return () => {
      isSubscribed = false;
      if (loadingTask) {
        loadingTask.destroy();
      }
    };
  }, [magazine]);

  // Render Page to Canvas
  const renderSinglePage = useCallback(
    async (
      pageNumber: number,
      canvas: HTMLCanvasElement | null,
      renderTaskRef: React.MutableRefObject<any>
    ) => {
      if (!pdfDoc || !canvas || pageNumber < 1 || pageNumber > numPages) {
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNumber);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        const containerHeight = Math.max(window.innerHeight - 160, 400);
        const targetHeight = containerHeight * zoomLevel;
        const scale = (targetHeight / unscaledViewport.height) * (window.devicePixelRatio || 1);

        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1)}px`;
          canvas.style.height = `${viewport.height / (window.devicePixelRatio || 1)}px`;

          const renderContext = {
            canvasContext: ctx,
            viewport,
            canvas,
          };

          const renderTask = page.render(renderContext);
          renderTaskRef.current = renderTask;
          await renderTask.promise;
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn(`Page ${pageNumber} render error:`, err);
        }
      }
    },
    [pdfDoc, numPages, zoomLevel]
  );

  // Render current active page(s) whenever page or view parameters change
  useEffect(() => {
    if (!pdfDoc || loading) return;

    if (isMobile) {
      renderSinglePage(currentPage, canvasLeftRef.current, renderTaskLeftRef);
    } else {
      if (currentPage === 1) {
        renderSinglePage(0, canvasLeftRef.current, renderTaskLeftRef);
        renderSinglePage(1, canvasRightRef.current, renderTaskRightRef);
      } else {
        const leftPageNum = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        const rightPageNum = leftPageNum + 1;

        renderSinglePage(leftPageNum, canvasLeftRef.current, renderTaskLeftRef);
        renderSinglePage(
          rightPageNum <= numPages ? rightPageNum : 0,
          canvasRightRef.current,
          renderTaskRightRef
        );
      }
    }
  }, [pdfDoc, currentPage, isMobile, zoomLevel, loading, renderSinglePage, numPages]);

  // Page Navigation Handlers
  const nextPage = () => {
    if (isMobile) {
      if (currentPage < numPages) {
        setPageFlipping("next");
        setCurrentPage((prev) => prev + 1);
        setTimeout(() => setPageFlipping(null), 300);
      }
    } else {
      if (currentPage === 1 && numPages > 1) {
        setPageFlipping("next");
        setCurrentPage(2);
        setTimeout(() => setPageFlipping(null), 300);
      } else if (currentPage + 2 <= numPages) {
        setPageFlipping("next");
        setCurrentPage((prev) => prev + 2);
        setTimeout(() => setPageFlipping(null), 300);
      } else if (currentPage + 1 === numPages) {
        setPageFlipping("next");
        setCurrentPage((prev) => prev + 1);
        setTimeout(() => setPageFlipping(null), 300);
      }
    }
  };

  const prevPage = () => {
    if (isMobile) {
      if (currentPage > 1) {
        setPageFlipping("prev");
        setCurrentPage((prev) => prev - 1);
        setTimeout(() => setPageFlipping(null), 300);
      }
    } else {
      if (currentPage <= 2) {
        setPageFlipping("prev");
        setCurrentPage(1);
        setTimeout(() => setPageFlipping(null), 300);
      } else {
        setPageFlipping("prev");
        setCurrentPage((prev) => Math.max(1, prev - 2));
        setTimeout(() => setPageFlipping(null), 300);
      }
    }
  };

  // Direct Page Input Jump Handler
  const handlePageInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = pageInputText.trim();
    const match = raw.match(/^(\d+)/);
    if (match) {
      let pageNum = parseInt(match[1], 10);
      pageNum = Math.max(1, Math.min(numPages, pageNum));
      setCurrentPage(pageNum);
    } else {
      setPageInputText(getPageDisplayString(currentPage, numPages, isMobile));
    }
    setIsEditingPage(false);
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    const modalElem = document.getElementById("flipbook-modal-container");
    if (!modalElem) return;

    if (!document.fullscreenElement) {
      modalElem
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(console.error);
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(console.error);
    }
  };

  // Share Handler
  const handleShare = async () => {
    const shareData = {
      title: magazine?.title || "KakatiyaPulse Magazine",
      text: `Read ${magazine?.title || "KakatiyaPulse Magazine"} on KakatiyaPulse digital reader.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard on cancelled/unsupported share
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextPage();
      } else {
        prevPage();
      }
    }
    touchStartXRef.current = null;
  };

  if (!magazine || !magazine.pdfUrl) return null;

  return (
    <div
      id="flipbook-modal-container"
      className="fixed inset-0 z-50 bg-[#F5F5F0] backdrop-blur-xl flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E5E0] px-4 sm:px-6 py-2.5 flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <Badge variant="gold" className="shrink-0 hidden sm:inline-flex">
            {magazine.year ? `${magazine.year} Edition` : "Flipbook"}
          </Badge>

          <h2 className="font-serif text-sm sm:text-base font-bold text-[#14532D] truncate">
            {magazine.title}
          </h2>

          <span className="text-[#E5E5E0] font-light hidden sm:inline">|</span>

          {/* Page Jump Control (pages: 10-11 / 27) */}
          <div className="flex items-center gap-1.5 text-xs text-[#555555]">
            <span className="font-medium hidden sm:inline">pages:</span>
            <form onSubmit={handlePageInputSubmit} className="inline-flex items-center">
              <input
                type="text"
                value={pageInputText}
                onChange={(e) => setPageInputText(e.target.value)}
                onFocus={() => setIsEditingPage(true)}
                onBlur={() => handlePageInputSubmit()}
                className="w-14 sm:w-16 h-7 text-center font-mono text-xs font-bold text-[#14532D] bg-[#F8F7F3] border border-[#E5E5E0] rounded px-1 focus:outline-none focus:border-[#C9A227] shadow-inner"
                title="Type page number and press Enter"
              />
            </form>
            <span className="font-mono text-[#555555]">/ {numPages}</span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a href={magazine.pdfUrl} target="_blank" rel="noopener noreferrer" download>
            <Button variant="green-outline" size="sm" className="h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </a>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7F3] hover:bg-[#E5E5E0] text-[#1C1C1C] hover:text-[#14532D] flex items-center justify-center transition-colors border border-[#E5E5E0] ml-1 cursor-pointer"
            title="Close Reader (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Flipbook Viewport */}
      <main
        className="flex-1 relative bg-[#F5F5F0] flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading Progress State */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-white/95 flex flex-col items-center justify-center space-y-4 p-4">
            {magazine.coverImageUrl ? (
              <div className="relative w-36 sm:w-48 aspect-[3/4] rounded-lg overflow-hidden border border-[#E5E5E0] shadow-xl mb-2 animate-pulse">
                <img src={magazine.coverImageUrl} alt={magazine.title} className="w-full h-full object-cover opacity-80" />
              </div>
            ) : null}
            <Loader2 className="w-8 h-8 text-[#14532D] animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-widest text-[#14532D] font-serif font-bold">
                Opening Magazine Edition...
              </p>
              <div className="w-48 h-1.5 bg-[#E5E5E0] rounded-full overflow-hidden mx-auto">
                <div
                  className="h-full bg-[#14532D] transition-all duration-200"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#555555] font-mono">{loadingProgress}%</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="absolute inset-0 z-30 bg-white/95 flex flex-col items-center justify-center p-6 text-center space-y-5">
            <BookOpen className="w-12 h-12 text-[#C9A227]" />
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#14532D]">Unable to open this edition.</h3>
              <p className="text-xs text-[#555555] max-w-sm font-mono">{error}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a href={magazine.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="green" size="sm" className="gap-2">
                  <BookOpen className="w-4 h-4" /> Open PDF
                </Button>
              </a>
              <a href={magazine.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <Button variant="green-outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Floating Left Chevron Navigation Button */}
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="absolute left-3 sm:left-6 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-[#14532D] text-[#14532D] hover:text-white border border-[#E5E5E0] flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#14532D] cursor-pointer shadow-xl backdrop-blur-sm"
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Floating Right Chevron Navigation Button */}
        <button
          onClick={nextPage}
          disabled={currentPage >= numPages}
          className="absolute right-3 sm:right-6 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-[#14532D] text-[#14532D] hover:text-white border border-[#E5E5E0] flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#14532D] cursor-pointer shadow-xl backdrop-blur-sm"
          title="Next Page (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Book Container with Page Turn Transitions */}
        <div
          className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ease-out ${
            pageFlipping === "next"
              ? "-translate-x-2 rotate-1"
              : pageFlipping === "prev"
              ? "translate-x-2 -rotate-1"
              : "translate-x-0 rotate-0"
          }`}
        >
          {isMobile ? (
            /* Mobile Single Page Canvas Container */
            <div className="relative rounded-md overflow-hidden border border-[#E5E5E0] shadow-xl bg-white">
              <canvas ref={canvasLeftRef} className="block max-h-[76vh] object-contain" />
            </div>
          ) : (
            /* Desktop Two-Page Spread Book Layout */
            <div className="relative flex items-center justify-center rounded-lg overflow-hidden border border-[#E5E5E0] shadow-2xl bg-white">
              {/* Central Book Spine Crease & Shadow */}
              {currentPage > 1 && (
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-10 pointer-events-none bg-gradient-to-r from-black/10 via-black/20 to-black/10" />
              )}

              {/* Left Page Canvas */}
              <div className="bg-white border-r border-[#E5E5E0] relative">
                <canvas
                  ref={canvasLeftRef}
                  className={`block max-h-[78vh] object-contain ${
                    currentPage === 1 ? "hidden" : "block"
                  }`}
                />
              </div>

              {/* Right Page Canvas */}
              <div className="bg-white relative">
                <canvas ref={canvasRightRef} className="block max-h-[78vh] object-contain" />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Controls Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/95 backdrop-blur-md border border-[#E5E5E0] rounded-full px-4 py-2 shadow-2xl gap-3 sm:gap-4 text-[#14532D]">
        {/* Thumbnails Overview Grid Toggle */}
        <button
          onClick={() => setShowThumbnails((prev) => !prev)}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            showThumbnails ? "bg-[#14532D] text-white shadow-md" : "hover:bg-[#F8F7F3] text-[#14532D]"
          }`}
          title="Thumbnails Overview Grid"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Table of Contents / Index List Toggle */}
        <button
          onClick={() => setShowThumbnails((prev) => !prev)}
          className="p-2 rounded-full hover:bg-[#F8F7F3] text-[#14532D] transition-colors cursor-pointer hidden sm:block"
          title="Table of Contents"
        >
          <List className="w-4 h-4" />
        </button>

        <span className="h-4 w-[1px] bg-[#E5E5E0]" />

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-[#F8F7F3] text-[#14532D] transition-colors cursor-pointer"
          title="Share Magazine Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <span className="h-4 w-[1px] bg-[#E5E5E0]" />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full hover:bg-[#F8F7F3] text-[#14532D] transition-colors cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <span className="h-4 w-[1px] bg-[#E5E5E0] hidden sm:block" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1.5 rounded-full hover:bg-[#F8F7F3] text-[#14532D] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-[#C9A227] font-bold w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.25))}
            className="p-1.5 rounded-full hover:bg-[#F8F7F3] text-[#14532D] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thumbnail Overview Drawer Overlay */}
      {showThumbnails && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-6">
            <div className="flex items-center gap-2.5 text-white">
              <LayoutGrid className="w-5 h-5 text-[#E8D48A]" />
              <h3 className="font-serif text-lg font-bold text-white">Magazine Pages &amp; Spreads</h3>
            </div>
            <button
              onClick={() => setShowThumbnails(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Overview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grid list of all pages */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-2">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => {
              const isCurrent = isMobile
                ? currentPage === pNum
                : currentPage === 1
                ? pNum === 1
                : pNum === currentPage ||
                  pNum === (currentPage % 2 === 0 ? currentPage : currentPage - 1) ||
                  pNum === (currentPage % 2 === 0 ? currentPage : currentPage - 1) + 1;

              return (
                <button
                  key={pNum}
                  onClick={() => {
                    setCurrentPage(pNum);
                    setShowThumbnails(false);
                  }}
                  className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center p-3 transition-all cursor-pointer shadow-lg ${
                    isCurrent
                      ? "border-[#C9A227] bg-[#14532D] text-white scale-105 shadow-2xl"
                      : "border-white/20 bg-white/10 text-white hover:border-[#E8D48A] hover:bg-white/20"
                  }`}
                >
                  <span className="font-serif font-bold text-base sm:text-lg">
                    {pNum === 1 ? "Cover" : `Page ${pNum}`}
                  </span>
                  <span className="text-[10px] opacity-70 font-mono mt-1">Edition Page {pNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#14532D] text-white px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-[#E8D48A]" />
          Magazine link copied to clipboard!
        </div>
      )}
    </div>
  );
}

