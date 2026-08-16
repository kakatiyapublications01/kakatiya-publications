import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#0d0d12] border-t border-[#d4af37]/20 relative overflow-hidden">
      {/* Decorative Gold Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-[#d4af37]/30 blur-sm rounded-full" />

      <Container size="xl" className="pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-zinc-800/80">
          {/* Column 1: Brand Overview */}
          <div className="space-y-4 lg:col-span-1">
            <Link href="/" className="inline-block">
              <div className="relative w-44 h-12">
                <Image
                  src="/logo.svg"
                  alt="Kakatiya Publications"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                Independent Editorial Press
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-amber-200 uppercase">
              Publications & Media
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/magazines" className="hover:text-[#d4af37] transition-colors">
                  Digital Magazine Archives
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-[#d4af37] transition-colors">
                  Editorial Stories & Messages
                </Link>
              </li>
              <li>
                <Link href="/vvip" className="hover:text-[#d4af37] transition-colors">
                  VVIP Prestige Features
                </Link>
              </li>
              <li>
                <Link href="/vip" className="hover:text-[#d4af37] transition-colors">
                  VIP Directory Profiles
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional Information */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-amber-200 uppercase">
              Organization
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-[#d4af37] transition-colors">
                  About Kakatiya Publications
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#d4af37] transition-colors">
                  Contact & Press Inquiries
                </Link>
              </li>
              <li>
                <span className="text-zinc-500">Separation Statement: Kakatiya Publications is strictly independent and separate from Kamma Voice.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold tracking-wider text-amber-200 uppercase">
              Headquarters
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {siteConfig.contact.address}
            </p>
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-500">Email:</span> {siteConfig.contact.email}
            </p>
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-500">Phone:</span> {siteConfig.contact.phone}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} Kakatiya Publications. All rights reserved. Premium Editorial Publishing.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              Terms of Service
            </Link>
            {/* Discrete Portal Link for Editorial Administrators */}
            <Link
              href="/admin/login"
              className="text-zinc-600 hover:text-amber-500/80 transition-colors"
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
