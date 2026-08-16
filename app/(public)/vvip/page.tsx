import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "VVIP Spotlight",
  description: "Prestigious VVIP profile features from Kakatiya Publications.",
};

export default function VvipPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle className="text-amber-400">Prestige & Distinction</SectionSubtitle>
            <H1 gradient>VVIP Spotlight</H1>
            <Text>
              An exclusive section showcasing visionary leaders, distinguished icons, and eminent personalities.
            </Text>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {[
              {
                name: "Dr. K. Ramachandra Rao",
                designation: "Visionary Entrepreneur & Philanthropist",
                badge: "Patron of Excellence",
                quote: "True leadership lies in empowering generations and preserving our core cultural heritage.",
                bio: "Dr. K. Ramachandra Rao has dedicated over three decades to building sustainable industrial enterprises while supporting education and heritage preservation.",
              },
              {
                name: "Smt. Vijayalakshmi Devi",
                designation: "Cultural Ambassador & Educationist",
                badge: "Visionary Leader",
                quote: "Knowledge and tradition are the twin pillars of any thriving publication and society.",
                bio: "Smt. Vijayalakshmi Devi has spearheaded transformative educational initiatives across Telangana, guiding thousands of young scholars.",
              },
            ].map((member, idx) => (
              <Card key={idx} hoverEffect glow className="p-8 border-[#d4af37]/40 bg-[#121217]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-4 aspect-[4/5] rounded-md bg-zinc-900 border border-[#d4af37]/30 flex flex-col justify-end p-6 relative overflow-hidden">
                    <div className="absolute top-4 left-4">
                      <Badge variant="vvip">{member.badge}</Badge>
                    </div>
                    <div className="space-y-1 z-10">
                      <h3 className="font-serif text-2xl font-bold text-white">{member.name}</h3>
                      <p className="text-xs text-[#d4af37] font-medium">{member.designation}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <div>
                      <Badge variant="vvip" className="mb-3">VVIP Feature</Badge>
                      <h2 className="font-serif text-3xl font-bold text-white">{member.name}</h2>
                      <p className="text-base text-[#d4af37] font-medium mt-1">{member.designation}</p>
                    </div>

                    <blockquote className="border-l-2 border-[#d4af37] pl-4 italic text-zinc-200 text-lg">
                      “{member.quote}”
                    </blockquote>

                    <Text className="text-sm leading-relaxed">{member.bio}</Text>

                    <div className="pt-2">
                      <Button variant="gold" size="md">
                        Read Detailed Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
