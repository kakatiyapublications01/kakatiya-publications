import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, H2, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us",
  description: "Learn about Kakatiya Publications editorial mission, heritage, and values.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Editorial Mission</SectionSubtitle>
            <H1 gradient>About Kakatiya Publications</H1>
            <Text className="text-lg">
              A premier luxury publishing house dedicated to excellence in digital media, editorial craft, and cultural preservation.
            </Text>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <Card className="p-8 space-y-6">
              <H2>Our Publishing Vision</H2>
              <Text className="leading-relaxed">
                Kakatiya Publications was founded with a vision to deliver sophisticated editorial content, document inspiring leadership journeys, and celebrate cultural heritage. As an independent press, we uphold the highest standards of publication ethics and presentation aesthetics.
              </Text>
              <Text className="leading-relaxed">
                Our digital magazines feature interactive book-style flipbooks designed for seamless reading across desktop and mobile devices.
              </Text>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <Card className="p-6 space-y-2">
                <span className="font-serif text-3xl font-bold text-[#d4af37]">Independent</span>
                <h4 className="font-serif text-lg font-bold text-white">Press Identity</h4>
                <p className="text-xs text-zinc-400">Completely autonomous and distinct entity.</p>
              </Card>

              <Card className="p-6 space-y-2">
                <span className="font-serif text-3xl font-bold text-[#d4af37]">High Definition</span>
                <h4 className="font-serif text-lg font-bold text-white">Digital Magazines</h4>
                <p className="text-xs text-zinc-400">Interactive double-page spread flipbooks.</p>
              </Card>

              <Card className="p-6 space-y-2">
                <span className="font-serif text-3xl font-bold text-[#d4af37]">Prestige</span>
                <h4 className="font-serif text-lg font-bold text-white">VVIP & VIP Spotlights</h4>
                <p className="text-xs text-zinc-400">Honoring distinguished leaders and patrons.</p>
              </Card>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
