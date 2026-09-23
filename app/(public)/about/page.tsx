import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { EditorialHeader } from "@/components/ui/typography";

export const metadata = {
  title: "About Us",
  description: "Learn about KakatiyaPulse editorial mission, publishing heritage, and values.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl">
          <EditorialHeader
            title="About KakatiyaPulse"
            subtitle="The Media House"
          />

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Masthead Statement */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#14532D]">
                A Heritage of Independent Community Journalism
              </h3>
              <p className="text-[#555555] text-base sm:text-lg leading-relaxed">
                KakatiyaPulse is an established Indian print and digital publication house dedicated to documenting cultural heritage, celebrating eminent leaders, and chronicling community progress with uncompromising editorial rigor.
              </p>
              <div className="h-[2px] w-16 bg-[#C9A227]" />
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-b border-[#E5E5E0] py-8">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                  Pillar I
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1C1C1C]">
                  Editorial Autonomy
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  KakatiyaPulse maintains strict institutional independence, upholding high standards of journalistic ethics and factual verification.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                  Pillar II
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1C1C1C]">
                  Print &amp; Digital Craft
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Every issue is curated with high-definition digital flipbooks, archival photography, and classic broadsheet layout design.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                  Pillar III
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1C1C1C]">
                  Living Heritage
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  We document leaders, entrepreneurs, and visionaries, building a permanent historical record for posterity.
                </p>
              </div>
            </div>

            {/* Editorial Board Note */}
            <div className="bg-[#F8F7F3] border border-[#E5E5E0] p-8 space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#14532D]">
                Institutional Note
              </span>
              <p className="font-serif italic text-base text-[#1C1C1C] leading-relaxed">
                &ldquo;Our digital edition is not designed to mimic fleeting social feeds or SaaS portals. It is crafted to reproduce the timeless dignity and deliberate composition of a physical magazine sitting on your desk.&rdquo;
              </p>
              <div className="text-xs font-semibold text-[#555555] uppercase tracking-wider">
                — The Editorial Board, KakatiyaPulse Media Publications
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
