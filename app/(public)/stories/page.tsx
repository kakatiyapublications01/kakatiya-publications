import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { EditorialHeader } from "@/components/ui/typography";
import { getPublishedStories } from "@/lib/firebase/stories";
import { FileText, Calendar, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Stories & Articles",
  description: "Read inspiring editorial columns, leadership messages, and cultural chronicles from KakatiyaPulse.",
};

export const revalidate = 60;

export default async function StoriesPage() {
  const stories = await getPublishedStories();
  const featuredStory = stories.length > 0 ? stories[0] : null;
  const moreStories = stories.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl">
          <EditorialHeader
            title="Stories &amp; Columns"
            subtitle="The Editorial Broadsheet"
          />

          {stories.length === 0 ? (
            <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] p-10 max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 border border-[#C9A227] flex items-center justify-center mx-auto text-[#14532D]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14532D] uppercase tracking-wide">
                No Stories Published Yet
              </h3>
              <p className="text-xs text-[#555555]">
                Articles and columns from the editorial board will appear here once released.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* 1. FEATURED LEAD STORY */}
              {featuredStory && (
                <div className="pb-12 border-b border-[#E5E5E0]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-0.5 bg-[#14532D] text-white">
                          Featured Story
                        </span>
                        {featuredStory.category && (
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
                            {featuredStory.category}
                          </span>
                        )}
                        {featuredStory.createdAt && (
                          <>
                            <span className="text-[#E5E5E0]">•</span>
                            <span className="text-xs font-mono text-[#555555]">
                              {new Date(featuredStory.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1C1C] hover:text-[#14532D] transition-colors leading-[1.15]">
                        {featuredStory.title}
                      </h2>

                      <p className="text-[#555555] text-base sm:text-lg leading-relaxed max-w-3xl">
                        {featuredStory.excerpt || featuredStory.content}
                      </p>
                    </div>

                    {/* Side Editorial Pull Box */}
                    <div className="lg:col-span-4 p-6 bg-[#F8F7F3] border border-[#E5E5E0] space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#C9A227] font-bold">
                        Editorial Perspective
                      </p>
                      <p className="font-serif italic text-sm text-[#14532D] leading-relaxed">
                        &ldquo;True journalism is not merely recording events, but celebrating the perseverance of those who shape community legacy.&rdquo;
                      </p>
                      <div className="h-[1px] w-12 bg-[#C9A227]" />
                      <p className="text-[11px] uppercase tracking-wider text-[#555555] font-semibold">
                        KakatiyaPulse Editorial Desk
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MORE STORIES (Editorial Columns) */}
              {moreStories.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-[#14532D]">
                    More Dispatches &amp; Columns
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {moreStories.map((story) => (
                      <div
                        key={story.id}
                        className="space-y-3 pb-6 border-b border-[#E5E5E0] flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold uppercase tracking-wider text-[#C9A227]">
                              {story.category || "Column"}
                            </span>
                            {story.createdAt && (
                              <span className="text-[#555555] font-mono">
                                {new Date(story.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-xl font-bold text-[#1C1C1C] hover:text-[#14532D] transition-colors leading-snug">
                            {story.title}
                          </h4>

                          <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed">
                            {story.excerpt || story.content}
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#14532D] hover:text-[#C9A227] cursor-pointer">
                            Read Article <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
