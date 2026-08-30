import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#14532D] text-white border-t border-[#C9A227]/30 relative overflow-hidden">
      {/* Top Gold Thin Divider Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />

      <Container size="xl" className="pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-[#C9A227]/25">
          {/* Column 1: Brand Overview */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 bg-white/10 rounded-lg p-1 border border-[#C9A227]/30 backdrop-blur-sm">
                  <Image
                    src="/logo.png"
                    alt="KakatiyaPulse"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl font-bold text-white tracking-wider leading-none">
                    KAKATIYA
                  </span>
                  <span className="text-[11px] font-bold text-[#E8D48A] tracking-[0.35em] leading-tight">
                    PULSE
                  </span>
                </div>
              </div>
            </Link>
            <p className="text-green-100/90 text-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-green-200/80 font-medium">
                Independent Editorial Press
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-[#E8D48A] uppercase">
              Publications & Media
            </h3>
            <ul className="space-y-2 text-sm text-green-100/80">
              <li>
                <Link href="/magazines" className="hover:text-[#E8D48A] transition-colors">
                  Digital Magazine Archives
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-[#E8D48A] transition-colors">
                  Editorial Stories & Messages
                </Link>
              </li>
              <li>
                <Link href="/vvip" className="hover:text-[#E8D48A] transition-colors">
                  VVIP Prestige Features
                </Link>
              </li>
              <li>
                <Link href="/vip" className="hover:text-[#E8D48A] transition-colors">
                  VIP Directory Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Information */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-[#E8D48A] uppercase">
              Organization
            </h3>
            <ul className="space-y-2 text-sm text-green-100/80">
              <li>
                <Link href="/about" className="hover:text-[#E8D48A] transition-colors">
                  About KakatiyaPulse
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E8D48A] transition-colors">
                  Contact & Press Inquiries
                </Link>
              </li>
              <li>
                <span className="text-green-200/60 text-xs">Separation Statement: KakatiyaPulse is strictly independent and separate from Kamma Voice.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-[#E8D48A] uppercase">
              Headquarters
            </h3>
            <p className="text-sm text-green-100/90 leading-relaxed">
              {siteConfig.contact.address}
            </p>
            <p className="text-sm text-green-100/90">
              <span className="text-green-200/60">Email:</span> {siteConfig.contact.email}
            </p>
            <p className="text-sm text-green-100/90">
              <span className="text-green-200/60">Phone:</span> {siteConfig.contact.phone}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-green-200/70">
          <p>
            © {new Date().getFullYear()} KakatiyaPulse. All rights reserved. Premium Editorial Publishing.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            {/* Discrete Portal Link for Editorial Administrators */}
            <Link
              href="/admin/login"
              className="text-green-300/60 hover:text-[#E8D48A] transition-colors"
              title="Administrator Sign In"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
