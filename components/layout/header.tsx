"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E0] shadow-sm transition-all duration-300">
      {/* Top Gold Thin Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />

      <Container size="xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-[1.03]">
              <Image
                src="/logo.png"
                alt="KakatiyaPulse"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-[#14532D] tracking-wider leading-none">
                KAKATIYA
              </span>
              <span className="text-[10px] font-bold text-[#C9A227] tracking-[0.35em] leading-tight">
                PULSE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {siteConfig.mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md ${
                    isActive
                      ? "text-[#14532D] font-semibold"
                      : "text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.title}
                    {item.badge && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#F8F7F3] text-[#C9A227] border border-[#E8D48A]">
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#C9A227]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#14532D] hover:bg-[#F8F7F3] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E5E5E0] bg-white animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col gap-1">
              {siteConfig.mainNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 text-base font-medium rounded-md flex items-center justify-between ${
                      isActive
                        ? "bg-[#F8F7F3] text-[#14532D] font-semibold border-l-2 border-[#C9A227]"
                        : "text-[#555555] hover:bg-[#F8F7F3] hover:text-[#14532D]"
                    }`}
                  >
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-[#F8F7F3] text-[#C9A227] border border-[#E8D48A]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
