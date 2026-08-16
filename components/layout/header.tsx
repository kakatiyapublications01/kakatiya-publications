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
    <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-[#d4af37]/20 transition-all duration-300">
      {/* Top Gold Thin Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

      <Container size="xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-48 h-12 transition-transform duration-300 group-hover:scale-[1.02]">
              <Image
                src="/logo.svg"
                alt="Kakatiya Publications"
                fill
                priority
                className="object-contain object-left"
              />
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
                  className={`relative px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-sm ${
                    isActive
                      ? "text-[#fde047] font-semibold"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.title}
                    {item.badge && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#fde047] border border-[#d4af37]/30">
                        {item.badge}
                      </span>
                    )}
                  </span>

                  {isActive && (
                    <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-[#d4af37] to-[#eab308]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none"
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
          <div className="lg:hidden py-4 border-t border-zinc-800/80 animate-in slide-in-from-top duration-200">
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
                        ? "bg-[#d4af37]/15 text-[#fde047] font-semibold border-l-2 border-[#d4af37]"
                        : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                    }`}
                  >
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="text-xs uppercase px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#fde047]">
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
