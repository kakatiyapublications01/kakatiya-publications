import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "VIP Directory",
  description: "Honored VIP member directory from Kakatiya Publications.",
};

export default function VipPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Honored Members</SectionSubtitle>
            <H1 gradient>VIP Directory</H1>
            <Text>
              Recognizing esteemed figures, community leaders, and distinguished professionals.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Sri M. Venkat Rao", role: "Industrialist & Patron", location: "Hyderabad" },
              { name: "Dr. S. Anuradha", role: "Chief Medical Director", location: "Vijayawada" },
              { name: "Sri P. Narsimha Reddy", role: "Education Trustee", location: "Warangal" },
              { name: "Smt. G. Rajeshwari", role: "Social Entrepreneur", location: "Visakhapatnam" },
              { name: "Sri K. Subba Rao", role: "Legal Luminary", location: "Hyderabad" },
              { name: "Dr. V. Prasad", role: "Research Scientist", location: "Bengaluru" },
            ].map((vip, i) => (
              <Card key={i} hoverEffect className="p-6">
                <CardContent className="space-y-4 text-center p-0">
                  <div className="w-24 h-24 mx-auto rounded-full bg-zinc-800 border-2 border-[#d4af37]/40 flex items-center justify-center text-amber-200 font-serif font-bold text-2xl shadow-xl">
                    {vip.name.split(" ")[1]?.[0] || "V"}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white">{vip.name}</h3>
                    <p className="text-xs text-amber-400 font-medium mt-1">{vip.role}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{vip.location}</p>
                  </div>
                  <Badge variant="vip">VIP Profile</Badge>
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
