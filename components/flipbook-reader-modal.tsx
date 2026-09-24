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
  BookOpen,
  Loader2,
  LayoutGrid,
  Search,
  Check,
} from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Magazine } from "@/types";
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

  // Magnifier State
  const [isMagnifierActive, setIsMagnifierActive] = useState<boolean>(false);
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // UI feature states
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [pageInputText, setPageInputText] = useState<string>("1");
  const [isEditingPage, setIsEditingPage] = useState<boolean>(false);

  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);

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
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMagnifierActive(false);
      }
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

    async function initPdf() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdfjs/pdf.worker.min.mjs`;

        const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;

        try {
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

        if (!isSubscribed) return;
        setLoadingProgress(50);

        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to download PDF stream (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (!isSubscribed) return;
        setLoadingProgress(85);

        loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
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
        console.error("[FlipbookReader] Critical PDF loading error:", err);
        if (isSubscribed) {
          setError(err?.message || "Failed to load publication PDF.");
          setLoading(false);
        }
      }
    }

    initPdf();

    return () => {
      isSubscribed = false;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [magazine]);

  // Render individual page onto canvas
  const renderPage = useCallback(
    async (pageNum: number, canvas: HTMLCanvasElement, taskRef: React.MutableRefObject<any>) => {
      if (!pdfDoc || pageNum < 1 || pageNum > numPages) return;

      if (taskRef.current) {
        try {
          taskRef.current.cancel();
        } catch (e) {
          // Ignore cancelled tasks
        }
        taskRef.current = null;
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1.0 });

        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const availableHeight = isFullscreen ? window.innerHeight - 100 : window.innerHeight - 140;

        let scale = (availableHeight / baseViewport.height) * zoomLevel;
        if (isMobile) {
          const availableWidth = window.innerWidth - 24;
          const widthScale = (availableWidth / baseViewport.width) * zoomLevel;
          scale = Math.min(scale, widthScale);
        }

        const viewport = page.getViewport({ scale: scale * dpr });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        taskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`[FlipbookReader] Error rendering page ${pageNum}:`, err);
        }
      }
    },
    [pdfDoc, numPages, zoomLevel, isFullscreen, isMobile]
  );

  // Render Spread whenever page or zoom changes
  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    if (isMobile) {
      if (canvasLeftRef.current) {
        renderPage(currentPage, canvasLeftRef.current, renderTaskLeftRef);
      }
    } else {
      if (currentPage === 1) {
        if (canvasRightRef.current) {
          renderPage(1, canvasRightRef.current, renderTaskRightRef);
        }
      } else {
        const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        const rightPage = leftPage + 1;

        if (canvasLeftRef.current) {
          renderPage(leftPage, canvasLeftRef.current, renderTaskLeftRef);
        }
        if (canvasRightRef.current && rightPage <= numPages) {
          renderPage(rightPage, canvasRightRef.current, renderTaskRightRef);
        }
      }
    }
  }, [pdfDoc, numPages, currentPage, zoomLevel, isFullscreen, isMobile, renderPage]);

  // Turn page navigation
  const prevPage = useCallback(() => {
    if (currentPage <= 1) return;
    setPageFlipping("prev");
    setTimeout(() => setPageFlipping(null), 250);

    if (isMobile) {
      setCurrentPage((p) => Math.max(1, p - 1));
    } else {
      if (currentPage <= 3) {
        setCurrentPage(1);
      } else {
        const currentLeft = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        setCurrentPage(Math.max(1, currentLeft - 2));
      }
    }
  }, [currentPage, isMobile]);

  const nextPage = useCallback(() => {
    if (currentPage >= numPages) return;
    setPageFlipping("next");
    setTimeout(() => setPageFlipping(null), 250);

    if (isMobile) {
      setCurrentPage((p) => Math.min(numPages, p + 1));
    } else {
      if (currentPage === 1) {
        setCurrentPage(2);
      } else {
        const currentLeft = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        setCurrentPage(Math.min(numPages, currentLeft + 2));
      }
    }
  }, [currentPage, numPages, isMobile]);

  // Direct page input submission
  const handlePageInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsEditingPage(false);

    const match = pageInputText.match(/\d+/);
    if (match) {
      const targetPage = parseInt(match[0], 10);
      if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= numPages) {
        setCurrentPage(targetPage);
        return;
      }
    }
    setPageInputText(getPageDisplayString(currentPage, numPages, isMobile));
  };

  // Fullscreen Handler
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const modalEl = document.getElementById("flipbook-modal-container");
        if (modalEl) {
          await modalEl.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  // Desktop Magnifier Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMagnifierActive || isMobile) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setMagnifierPos({
      x: mouseX,
      y: mouseY,
      visible: true,
    });

    // Check which canvas the mouse is hovering over
    const leftCanvas = canvasLeftRef.current;
    const rightCanvas = canvasRightRef.current;
    const targetCanvas =
      rightCanvas && rightCanvas.getBoundingClientRect().left <= mouseX
        ? rightCanvas
        : leftCanvas;

    if (!targetCanvas || !magnifierCanvasRef.current) return;

    const rect = targetCanvas.getBoundingClientRect();
    if (
      mouseX >= rect.left &&
      mouseX <= rect.right &&
      mouseY >= rect.top &&
      mouseY <= rect.bottom
    ) {
      // Relative coordinates on the target canvas
      const relX = (mouseX - rect.left) * (targetCanvas.width / rect.width);
      const relY = (mouseY - rect.top) * (targetCanvas.height / rect.height);

      const magCanvas = magnifierCanvasRef.current;
      const magCtx = magCanvas.getContext("2d");
      if (!magCtx) return;

      const sourceWidth = 85;
      const sourceHeight = 85;

      magCtx.clearRect(0, 0, magCanvas.width, magCanvas.height);
      magCtx.drawImage(
        targetCanvas,
        relX - sourceWidth / 2,
        relY - sourceHeight / 2,
        sourceWidth,
        sourceHeight,
        0,
        0,
        magCanvas.width,
        magCanvas.height
      );
    }
  };

  const handleMouseLeave = () => {
    setMagnifierPos((prev) => ({ ...prev, visible: false }));
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
      className="fixed inset-0 z-50 bg-[#F8F7F3] flex flex-col justify-between overflow-hidden select-none"
    >
      {/* 1. TOP HEADER BAR */}
      <header className="bg-white border-b border-[#E5E5E0] px-4 sm:px-8 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 bg-[#14532D] text-white">
            {magazine.year ? `${magazine.year} Edition` : "Magazine"}
          </span>

          <h2 className="font-serif text-sm sm:text-base font-bold text-[#14532D] truncate">
            {magazine.title}
          </h2>

          <span className="text-[#E5E5E0] hidden sm:inline">|</span>

          {/* Quick Page Jump */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#555555]">
            <span className="uppercase text-[10px] tracking-wider font-semibold">Page:</span>
            <form onSubmit={handlePageInputSubmit} className="inline-flex items-center">
              <input
                type="text"
                value={pageInputText}
                onChange={(e) => setPageInputText(e.target.value)}
                onFocus={() => setIsEditingPage(true)}
                onBlur={() => handlePageInputSubmit()}
                className="w-14 h-6 text-center font-mono text-xs font-bold text-[#14532D] bg-[#F8F7F3] border border-[#E5E5E0] rounded-[2px] px-1 focus:outline-none focus:border-[#C9A227]"
                title="Type page number and press Enter"
              />
            </form>
            <span className="font-mono text-[#555555]">/ {numPages}</span>
          </div>
        </div>

        {/* Right Header Tools */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={magazine.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="hidden sm:inline-flex"
          >
            <Button variant="green-outline" size="sm" className="gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
          </a>

          <button
            onClick={onClose}
            className="p-1.5 text-[#555555] hover:text-[#14532D] hover:bg-[#E5E5E0] transition-colors border border-[#E5E5E0] rounded-[2px] cursor-pointer"
            title="Close Reader (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN PUBLICATION DESK VIEWPORT */}
      <main
        className="flex-1 relative bg-[#F8F7F3] flex items-center justify-center overflow-hidden p-2 sm:p-6 cursor-default"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Loading Progress State */}
        {loading && (
          <div className="absolute inset-0 z-30 bg-[#F8F7F3] flex flex-col items-center justify-center space-y-4 p-4">
            <Loader2 className="w-8 h-8 text-[#14532D] animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#14532D] font-bold">
                Opening Digital Publication...
              </p>
              <div className="w-48 h-1 bg-[#E5E5E0] rounded-none overflow-hidden mx-auto">
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
          <div className="absolute inset-0 z-30 bg-white flex flex-col items-center justify-center p-6 text-center space-y-5">
            <BookOpen className="w-10 h-10 text-[#C9A227]" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#14532D]">
                Unable to open this edition.
              </h3>
              <p className="text-xs text-[#555555] max-w-sm font-mono">{error}</p>
            </div>
            <div className="flex items-center gap-3">
              <a href={magazine.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="green" size="sm">Open Direct PDF</Button>
              </a>
            </div>
          </div>
        )}

        {/* Left Page Turn Chevron Button */}
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="absolute left-3 sm:left-6 z-20 w-11 h-11 bg-white hover:bg-[#14532D] text-[#14532D] hover:text-white border border-[#E5E5E0] flex items-center justify-center transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer shadow-sm rounded-[2px]"
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right Page Turn Chevron Button */}
        <button
          onClick={nextPage}
          disabled={currentPage >= numPages}
          className="absolute right-3 sm:right-6 z-20 w-11 h-11 bg-white hover:bg-[#14532D] text-[#14532D] hover:text-white border border-[#E5E5E0] flex items-center justify-center transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer shadow-sm rounded-[2px]"
          title="Next Page (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Book Container with Page Turn Transitions */}
        <div
          ref={bookContainerRef}
          className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-200 ease-out ${
            pageFlipping === "next"
              ? "-translate-x-1"
              : pageFlipping === "prev"
              ? "translate-x-1"
              : "translate-x-0"
          }`}
        >
          {isMobile ? (
            /* Mobile Single Page Canvas Container */
            <div className="relative overflow-hidden border border-[#E5E5E0] magazine-shadow bg-white">
              <canvas ref={canvasLeftRef} className="block max-h-[78vh] object-contain" />
            </div>
          ) : (
            /* Desktop Two-Page Spread Book Layout */
            <div className="relative flex items-center justify-center overflow-hidden border border-[#E5E5E0] magazine-shadow bg-white">
              {/* Central Spine Shadow */}
              {currentPage > 1 && (
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 z-10 pointer-events-none bg-gradient-to-r from-black/10 via-black/20 to-black/10" />
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

        {/* 3. INTERACTIVE CIRCULAR DESKTOP MAGNIFIER LENS */}
        {isMagnifierActive && !isMobile && magnifierPos.visible && (
          <div
            className="fixed pointer-events-none z-50 w-[190px] h-[190px] rounded-full border-4 border-[#14532D] ring-2 ring-[#C9A227] shadow-2xl overflow-hidden bg-white"
            style={{
              left: `${magnifierPos.x - 95}px`,
              top: `${magnifierPos.y - 95}px`,
            }}
          >
            <canvas
              ref={magnifierCanvasRef}
              width={190}
              height={190}
              className="w-full h-full block"
            />
            {/* Center crosshair / brass rim highlight */}
            <div className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
          </div>
        )}
      </main>

      {/* 4. CLEAN EDITORIAL CONTROLS TOOLBAR */}
      <footer className="bg-white border-t border-[#E5E5E0] px-4 py-2.5 z-30 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 text-[#14532D]">
          {/* Left: Previous | Page X / Y | Next */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="text-xs uppercase font-bold tracking-wider hover:text-[#C9A227] disabled:opacity-30 disabled:hover:text-[#14532D] cursor-pointer"
            >
              Previous
            </button>

            <span className="text-[#E5E5E0]">|</span>

            <span className="text-xs font-mono font-bold text-[#1C1C1C]">
              Page {getPageDisplayString(currentPage, numPages, isMobile)} / {numPages}
            </span>

            <span className="text-[#E5E5E0]">|</span>

            <button
              onClick={nextPage}
              disabled={currentPage >= numPages}
              className="text-xs uppercase font-bold tracking-wider hover:text-[#C9A227] disabled:opacity-30 disabled:hover:text-[#14532D] cursor-pointer"
            >
              Next
            </button>
          </div>

          {/* Right: Secondary Tools */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Magnifier Lens Toggle (Desktop Only) */}
            {!isMobile && (
              <button
                onClick={() => setIsMagnifierActive((prev) => !prev)}
                className={`p-1.5 rounded-[2px] transition-colors cursor-pointer border ${
                  isMagnifierActive
                    ? "bg-[#14532D] text-white border-[#14532D]"
                    : "border-[#E5E5E0] text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3]"
                }`}
                title={isMagnifierActive ? "Disable Magnifier Lens" : "Activate Magnifying Glass"}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 border border-[#E5E5E0] px-1 py-0.5 rounded-[2px]">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.2))}
                className="p-1 text-[#555555] hover:text-[#14532D] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-[#555555] w-8 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                className="p-1 text-[#555555] hover:text-[#14532D] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thumbnails Grid Toggle */}
            <button
              onClick={() => setShowThumbnails((prev) => !prev)}
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer border ${
                showThumbnails
                  ? "bg-[#14532D] text-white border-[#14532D]"
                  : "border-[#E5E5E0] text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3]"
              }`}
              title="Page Overview Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-[2px] border border-[#E5E5E0] text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3] cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </footer>

      {/* 5. THUMBNAILS DRAWER OVERLAY */}
      {showThumbnails && (
        <div className="absolute inset-0 z-40 bg-black/80 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-6">
            <h3 className="font-serif text-base font-bold text-white uppercase tracking-wider">
              Issue Pages &amp; Spreads
            </h3>
            <button
              onClick={() => setShowThumbnails(false)}
              className="p-1 text-white hover:text-[#C9A227] cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                  className={`aspect-[3/4] border flex flex-col items-center justify-center p-3 transition-colors cursor-pointer ${
                    isCurrent
                      ? "border-[#C9A227] bg-[#14532D] text-white"
                      : "border-white/20 bg-white/5 text-white hover:border-[#C9A227] hover:bg-white/10"
                  }`}
                >
                  <span className="font-serif font-bold text-sm sm:text-base">
                    {pNum === 1 ? "Cover" : `Page ${pNum}`}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono mt-1">Edition {pNum}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
