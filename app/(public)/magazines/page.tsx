import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, H2, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Magazines Archive",
  description: "Browse and read luxury digital flipbook magazines from Kakatiya Publications.",
};

export default function MagazinesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Digital Library</SectionSubtitle>
            <H1 gradient>Magazines Archive</H1>
            <Text>
              Explore our digital collection of high-resolution publications, complete with interactive flipbook viewing.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "August 2026 Edition", month: "August", year: 2026, pages: 64, badge: "Latest Edition" },
              { title: "July 2026 Special Issue", month: "July", year: 2026, pages: 56, badge: "Archive" },
              { title: "June 2026 Collector's Issue", month: "June", year: 2026, pages: 60, badge: "Archive" },
            ].map((mag, i) => (
              <Card key={i} hoverEffect glow={i === 0}>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <Badge variant={i === 0 ? "gold" : "neutral"}>{mag.badge}</Badge>
                    <span className="text-xs text-zinc-500 font-mono">{mag.pages} Pages</span>
                  </div>

                  <div className="aspect-[3/4] w-full rounded bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="font-serif text-2xl font-bold text-amber-200">{mag.month.toUpperCase()}</h3>
                    <p className="text-xs text-zinc-400 tracking-widest mt-1">{mag.year}</p>
                    <span className="text-[10px] text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 rounded mt-4">
                      Digital PDF Flipbook
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">{mag.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">Official Publication of Kakatiya Publications</p>
                  </div>

                  <Button variant={i === 0 ? "gold" : "gold-outline"} className="w-full">
                    Read Edition
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
