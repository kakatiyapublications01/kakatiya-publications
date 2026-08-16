import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Stories & Messages",
  description: "Read inspiring stories, editorial messages, and cultural features from Kakatiya Publications.",
};

export default function StoriesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Editorial Writings</SectionSubtitle>
            <H1 gradient>Stories & Messages</H1>
            <Text>
              Curated articles, official messages from community leaders, and in-depth cultural documentaries.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Preserving Kakatiya Heritage for Future Generations",
                category: "Editorial",
                date: "August 12, 2026",
                excerpt: "An in-depth study into the rich architectural marvels and social governance legacy of the Kakatiya era.",
              },
              {
                title: "Special Message from the Editorial Board",
                category: "Message",
                date: "August 05, 2026",
                excerpt: "Announcing new digital initiatives and interactive archives for readers worldwide.",
              },
              {
                title: "Empowering Next Generation Leaders in Telugu States",
                category: "Cultural",
                date: "July 28, 2026",
                excerpt: "Spotlighting young innovators and cultural custodians transforming community development.",
              },
              {
                title: "Documenting Architectural Legacies of Warangal",
                category: "Feature",
                date: "July 15, 2026",
                excerpt: "A visual essay exploring stone craftsmanship, temples, and irrigation feats.",
              },
            ].map((story, i) => (
              <Card key={i} hoverEffect className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <Badge variant="gold">{story.category}</Badge>
                    <span className="text-zinc-500">{story.date}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white hover:text-[#d4af37] transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">{story.excerpt}</p>
                  <span className="text-xs font-semibold text-[#d4af37] hover:underline cursor-pointer inline-block pt-2">
                    Read Story →
                  </span>
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
