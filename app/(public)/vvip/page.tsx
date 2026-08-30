import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedVvipMembers } from "@/lib/firebase/vvip";
import { Crown, Sparkles } from "lucide-react";

export const metadata = {
  title: "VVIP Spotlight",
  description: "Prestigious VVIP profile features from KakatiyaPulse.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function VvipPage() {
  const vvipMembers = await getPublishedVvipMembers();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Prestige &amp; Distinction</SectionSubtitle>
            <H1 gradient>VVIP Spotlight</H1>
            <Text className="text-[#555555]">
              An exclusive section showcasing visionary leaders, distinguished icons, and eminent personalities.
            </Text>
          </div>

          {vvipMembers.length === 0 ? (
            <div className="text-center py-20 bg-[#F8F7F3] border border-[#E5E5E0] rounded-2xl p-10 max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-[#C9A227]/30 flex items-center justify-center mx-auto text-[#C9A227]">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D]">No VVIP Features Published</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Exclusive VVIP spotlight features will appear here once officially documented and published by the editorial board.
              </p>
            </div>
          ) : (
            <div className="space-y-12 max-w-5xl mx-auto">
              {vvipMembers.map((member) => (
                <Card key={member.id} hoverEffect glow className="p-8 border-[#E5E5E0] bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-4 aspect-[4/5] rounded-lg bg-[#F8F7F3] border border-[#E5E5E0] flex flex-col justify-end p-6 relative overflow-hidden shadow-md">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : null}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="vvip">{member.badge || "VVIP Prestige"}</Badge>
                      </div>
                      <div className="space-y-1 z-10 relative bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 rounded text-white">
                        <h3 className="font-serif text-2xl font-bold text-white">{member.name}</h3>
                        <p className="text-xs text-[#E8D48A] font-semibold">{member.designation}</p>
                      </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                      <div>
                        <Badge variant="vvip" className="mb-3">
                          <Sparkles className="w-3 h-3 mr-1 inline" />
                          VVIP Feature
                        </Badge>
                        <h2 className="font-serif text-3xl font-bold text-[#14532D]">{member.name}</h2>
                        <p className="text-base text-[#C9A227] font-semibold mt-1">{member.designation}</p>
                      </div>

                      {member.quote && (
                        <blockquote className="border-l-2 border-[#C9A227] pl-4 italic text-[#555555] text-lg">
                          &ldquo;{member.quote}&rdquo;
                        </blockquote>
                      )}

                      {member.bio && <Text className="text-sm leading-relaxed text-[#555555]">{member.bio}</Text>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
