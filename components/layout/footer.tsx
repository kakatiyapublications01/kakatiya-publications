"use client";
import React from "react";
import { Phone, Eye } from "lucide-react";

// TODO: Replace with real analytics API call when live data is ready
const FAKE_TOTAL_VIEWS = 7012;

export function KakatiyaFooter() {
  return (
    <footer className="w-full bg-[#07130c] text-[#FDFBF7] py-12 px-6 border-t border-emerald-900/40">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        {/* Brand Info */}
        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-[#C9A227]">
            KakatiyaPulse
          </h3>
          <p className="text-xs text-emerald-100/70 max-w-sm">
            కాకతీయ పబ్లికేషన్స్ ప్రత్యేక సంచిక 2026 • ఆంధ్రప్రదేశ్ ప్రగతి మరియు అభివృద్ధి నివేదిక.
          </p>
          {/* Total Views Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-[#C9A227]/30 px-4 py-2 rounded-full">
            <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
            <span className="text-[#C9A227] font-mono font-bold text-sm">
              {FAKE_TOTAL_VIEWS.toLocaleString()}
            </span>
            <span className="text-emerald-200/60 text-xs">Total Views</span>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm font-medium">
          <span className="text-[#C9A227] font-semibold uppercase tracking-wider text-xs">
            Contact Us:
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+918247330933"
              className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 px-4 py-2 rounded-lg transition-colors text-white"
            >
              <Phone className="w-4 h-4 text-[#C9A227]" />
              +91 8247330933
            </a>
            <a
              href="tel:+919014208908"
              className="flex items-center gap-2 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 px-4 py-2 rounded-lg transition-colors text-white"
            >
              <Phone className="w-4 h-4 text-[#C9A227]" />
              +91 9014208908
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-emerald-900/30 text-center text-xs text-emerald-100/40">
        © 2026 KakatiyaPulse. All Rights Reserved.
      </div>
    </footer>
  );
}

// Export as Footer as well for drop-in compatibility across the app
export const Footer = KakatiyaFooter;
export default KakatiyaFooter;
