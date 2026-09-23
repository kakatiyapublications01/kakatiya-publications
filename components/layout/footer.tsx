import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#14532D] text-[#F8F7F3] border-t-2 border-[#C9A227]/60">
      <Container size="xl" className="pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
          {/* Column 1: Publication Brand (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/logo.png"
                  alt="KakatiyaPulse"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-wider text-white uppercase leading-none">
                  KAKATIYAPULSE
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#E8D48A] mt-1 font-semibold">
                  Print &amp; Digital Journal
                </span>
              </div>
            </Link>
            <p className="text-sm text-green-100/80 leading-relaxed max-w-sm">
              An independent, premium editorial publication dedicated to documenting culture, leadership, community excellence, and inspiring achievements.
            </p>
            <p className="text-xs text-[#E8D48A]/80 tracking-wider uppercase font-medium">
              Registered Publication • All India Circulation
            </p>
          </div>

          {/* Column 2: Editorial & Archives (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#E8D48A] font-bold border-b border-[#C9A227]/30 pb-2">
              Publications
            </h4>
            <ul className="space-y-2 text-xs tracking-wider uppercase">
              <li>
                <Link href="/magazines" className="text-green-100/80 hover:text-white transition-colors">
                  Digital Magazine Archives
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-green-100/80 hover:text-white transition-colors">
                  Editorial Stories &amp; Columns
                </Link>
              </li>
              <li>
                <Link href="/vvip" className="text-green-100/80 hover:text-white transition-colors">
                  VVIP Prestige Features
                </Link>
              </li>
              <li>
                <Link href="/vip" className="text-green-100/80 hover:text-white transition-colors">
                  VIP Directory Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The House (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#E8D48A] font-bold border-b border-[#C9A227]/30 pb-2">
              The House
            </h4>
            <ul className="space-y-2 text-xs tracking-wider uppercase">
              <li>
                <Link href="/about" className="text-green-100/80 hover:text-white transition-colors">
                  Editorial Mission
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-green-100/80 hover:text-white transition-colors">
                  Press &amp; Inquiries
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-green-100/80 hover:text-white transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Editorial Desk (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#E8D48A] font-bold border-b border-[#C9A227]/30 pb-2">
              Editorial Office
            </h4>
            <div className="space-y-1.5 text-xs text-green-100/80">
              <p className="font-semibold text-white">KakatiyaPulse Editorial Board</p>
              <p>{siteConfig.contact.address}</p>
              <p>Email: {siteConfig.contact.email}</p>
              <p>Phone: {siteConfig.contact.phone}</p>
            </div>
            <p className="text-[11px] text-green-200/50 pt-1 leading-normal italic">
              KakatiyaPulse is strictly autonomous and independent from Kamma Voice.
            </p>
          </div>
        </div>

        {/* Thin Gold Horizontal Divider */}
        <div className="h-[1px] w-full bg-[#C9A227]/40 mb-6" />

        {/* Bottom Copyright & Masthead note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-green-200/70">
          <p>
            &copy; {new Date().getFullYear()} KakatiyaPulse Media Publications. All rights reserved.
          </p>
          <p className="tracking-widest uppercase text-[10px] text-[#E8D48A]">
            Heritage • Truth • Excellence
          </p>
        </div>
      </Container>
    </footer>
  );
}
