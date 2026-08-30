import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedVipMembers } from "@/lib/firebase/vip";
import { Award, MapPin, UserCheck } from "lucide-react";

export const metadata = {
  title: "VIP Directory",
  description: "Honored VIP member directory from KakatiyaPulse.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function VipPage() {
  const vipMembers = await getPublishedVipMembers();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Honored Members</SectionSubtitle>
            <H1 gradient>VIP Directory</H1>
            <Text className="text-[#555555]">
              Recognizing esteemed figures, community leaders, and distinguished professionals.
            </Text>
          </div>

          {vipMembers.length === 0 ? (
            <div className="text-center py-20 bg-[#F8F7F3] border border-[#E5E5E0] rounded-2xl p-10 max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-[#C9A227]/30 flex items-center justify-center mx-auto text-[#C9A227]">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D]">No VIP Entries Published</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Official VIP directory profiles will appear here once verified and published by the editorial board.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {vipMembers.map((vip) => (
                <Card key={vip.id} hoverEffect className="p-6 bg-white border-[#E5E5E0]">
                  <CardContent className="space-y-4 text-center p-0">
                    <div className="w-24 h-24 mx-auto rounded-full bg-[#F8F7F3] border-2 border-[#C9A227] flex items-center justify-center text-[#14532D] font-serif font-bold text-2xl shadow-sm overflow-hidden relative">
                      {vip.imageUrl ? (
                        <img src={vip.imageUrl} alt={vip.name} className="w-full h-full object-cover" />
                      ) : (
                        vip.name.charAt(0) || "V"
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1C1C1C]">{vip.name}</h3>
                      {vip.designation && (
                        <p className="text-xs text-[#C9A227] font-semibold mt-1">{vip.designation}</p>
                      )}
                      {vip.location && (
                        <p className="text-xs text-[#555555] mt-0.5 flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 text-[#555555]" />
                          {vip.location}
                        </p>
                      )}
                    </div>
                    <Badge variant="vip">VIP Profile</Badge>
                  </CardContent>
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
