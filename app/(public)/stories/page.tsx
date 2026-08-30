import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedStories } from "@/lib/firebase/stories";
import { FileText, Calendar, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Stories & Messages",
  description: "Read inspiring stories, editorial messages, and cultural features from KakatiyaPulse.",
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-16">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <SectionSubtitle>Editorial Writings</SectionSubtitle>
            <H1 gradient>Stories &amp; Messages</H1>
            <Text className="text-[#555555]">
              Curated articles, official messages from community leaders, and in-depth cultural documentaries.
            </Text>
          </div>

          {stories.length === 0 ? (
            <div className="text-center py-20 bg-[#F8F7F3] border border-[#E5E5E0] rounded-2xl p-10 max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-[#C9A227]/30 flex items-center justify-center mx-auto text-[#C9A227]">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#14532D]">No Stories Published Yet</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                Official editorial writings and community messages will appear here once released.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stories.map((story) => (
                <Card key={story.id} hoverEffect className="p-6 bg-white border-[#E5E5E0]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <Badge variant="gold">{story.category || "Editorial"}</Badge>
                      {story.createdAt && (
                        <span className="text-[#555555] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#555555]" />
                          {new Date(story.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#14532D] hover:text-[#166534] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[#555555] text-sm leading-relaxed">{story.excerpt || story.content}</p>
                    <span className="text-xs font-semibold text-[#14532D] hover:text-[#166534] hover:underline cursor-pointer flex items-center gap-1 pt-2">
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
