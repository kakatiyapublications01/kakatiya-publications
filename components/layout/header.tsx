"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Search, Menu, X, Mail } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const todayDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const navItems = [
    { title: "HOME", href: "/" },
    { title: "MAGAZINES", href: "/magazines" },
    { title: "STORIES", href: "/stories" },
    { title: "VIP", href: "/vip" },
    { title: "VVIP", href: "/vvip" },
    { title: "ABOUT", href: "/about" },
    { title: "CONTACT", href: "/contact" },
  ];

  return (
    <header className="w-full bg-white border-b border-[#E5E5E0] z-40">
      {/* 1. Top Thin Publication Line */}
      <div className="bg-[#14532D] text-[#F8F7F3] border-b border-[#C9A227]/40 py-1.5 px-4 text-[11px] uppercase tracking-[0.15em]">
        <Container size="xl" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>{todayDate}</span>
            <span className="text-[#C9A227] hidden sm:inline">•</span>
            <span className="hidden sm:inline text-white/80">Digital Edition</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#E8D48A] hidden md:inline">The Independent Voice of Community Heritage</span>
            <Link
              href="/admin/login"
              className="text-[#E8D48A] hover:text-white transition-colors"
            >
              Staff Portal
            </Link>
          </div>
        </Container>
      </div>

      {/* 2. Main Editorial Masthead */}
      <div className="py-4 sm:py-6 border-b border-[#E5E5E0]">
        <Container size="xl">
          <div className="grid grid-cols-3 items-center">
            {/* LEFT: Logo & Heritage Line */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="KakatiyaPulse Emblem"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#555555]">
                    Established 2024
                  </span>
                  <span className="text-xs font-serif italic text-[#14532D]">
                    Journal of Excellence
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER: Grand Publication Masthead */}
            <div className="text-center flex flex-col items-center justify-center">
              <Link href="/">
                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.08em] text-[#14532D] uppercase leading-none hover:opacity-95 transition-opacity">
                  KAKATIYAPULSE
                </h1>
              </Link>
              <p className="text-[9px] sm:text-[10px] tracking-[0.35em] text-[#C9A227] uppercase font-semibold mt-1">
                Print &amp; Digital Magazine
              </p>
            </div>

            {/* RIGHT: Search & Contact Utilities */}
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              <Link
                href="/magazines"
                className="hidden sm:flex items-center gap-1.5 text-xs text-[#555555] hover:text-[#14532D] transition-colors uppercase tracking-wider"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Archive Search</span>
              </Link>

              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-[#14532D] text-[#14532D] hover:bg-[#14532D] hover:text-white transition-colors uppercase tracking-wider rounded-[2px]"
              >
                <Mail className="w-3 h-3" />
                <span>Contact</span>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#14532D] hover:bg-[#F8F7F3] border border-[#E5E5E0] rounded-[2px]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* 3. Clean Editorial Navigation Bar (Desktop) */}
      <nav className="hidden lg:block bg-white">
        <Container size="xl">
          <div className="flex items-center justify-center py-2.5">
            <div className="flex items-center text-xs tracking-[0.15em] font-semibold text-[#1C1C1C]">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <React.Fragment key={item.href}>
                    {index > 0 && (
                      <span className="text-[#E5E5E0] mx-4 font-light select-none">|</span>
                    )}
                    <Link
                      href={item.href}
                      className={`py-1 transition-colors relative hover:text-[#14532D] ${
                        isActive ? "text-[#14532D] font-bold" : "text-[#555555]"
                      }`}
                    >
                      {item.title}
                      {isActive && (
                        <span className="absolute -bottom-2.5 left-0 right-0 h-[2px] bg-[#C9A227]" />
                      )}
                    </Link>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </Container>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E5E0] px-6 py-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 divide-y divide-[#E5E5E0]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`pt-3 text-sm tracking-wider font-semibold uppercase flex items-center justify-between ${
                    isActive ? "text-[#14532D]" : "text-[#555555] hover:text-[#14532D]"
                  }`}
                >
                  <span>{item.title}</span>
                  {isActive && <span className="w-1.5 h-1.5 bg-[#C9A227] rounded-full" />}
                </Link>
              );
            })}
          </div>
          <div className="pt-5 mt-4 border-t border-[#E5E5E0] flex items-center justify-between">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-xs uppercase tracking-wider font-bold py-2.5 bg-[#14532D] text-white rounded-[2px]"
            >
              Contact Editorial Desk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
