import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, SectionSubtitle, Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WelcomeFlow } from "@/components/welcome/welcome-flow";
import { HomePersonalizedBanner } from "@/components/welcome/home-personalized-banner";
import { LiveVisitorCount } from "@/components/live-visitor-count";
import { getPublishedMagazines } from "@/lib/firebase/magazines";
import { getPublishedVvipMembers } from "@/lib/firebase/vvip";
import { getPublishedStories } from "@/lib/firebase/stories";
import { getPublishedVipMembers } from "@/lib/firebase/vip";
import {
  BookOpen,
  Crown,
  UserCheck,
  FileText,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
} from "lucide-react";

export const revalidate = 60; // Revalidate dynamic content every 60s

export default async function HomePage() {
  const [magazines, vvipMembers, stories, vipMembers] = await Promise.all([
    getPublishedMagazines().catch(() => []),
    getPublishedVvipMembers().catch(() => []),
    getPublishedStories().catch(() => []),
    getPublishedVipMembers().catch(() => []),
  ]);

  const latestMagazine = magazines.length > 0 ? magazines[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <WelcomeFlow />
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-white border-b border-[#E5E5E0]">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#C9A227]/5 blur-[120px] rounded-full pointer-events-none" />

          <Container size="xl" className="relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Personalized Visitor Name & Live Reader Count Banners */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <HomePersonalizedBanner />
                <LiveVisitorCount />
              </div>

              <SectionSubtitle>Independent Editorial &amp; Community Publication</SectionSubtitle>

              <H1 gradient className="leading-tight sm:leading-tight">
                KakatiyaPulse
              </H1>

              {/* Decorative Gold Accent Line */}
              <div className="w-24 h-[2px] bg-[#C9A227] mx-auto opacity-75" />

              <p className="font-serif text-xl sm:text-2xl text-[#555555] font-normal italic tracking-wide max-w-2xl mx-auto">
                &ldquo;Celebrating Excellence, Preserving Legacy, and Documenting History&rdquo;
              </p>

              <Text className="text-[#555555] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Welcome to the official digital portal of KakatiyaPulse. Discover our high-definition flipbook magazines, prestigious VVIP spotlights, VIP directories, and exclusive editorial messages.
              </Text>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link href="/magazines">
                  <Button variant="green" size="lg" className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Explore Magazines
                  </Button>
                </Link>
                <Link href="/vvip">
                  <Button variant="green-outline" size="lg" className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    VVIP Spotlight
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* LATEST MAGAZINE EDITION */}
        <section className="py-20 bg-[#F8F7F3] border-b border-[#E5E5E0] relative">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Current Edition</SectionSubtitle>
                <H2 className="mt-2">Latest Magazine</H2>
              </div>
              <Link href="/magazines" className="mt-4 md:mt-0 text-sm font-semibold text-[#14532D] hover:text-[#166534] hover:underline flex items-center gap-1">
                View All Editions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {latestMagazine ? (
              <Card hoverEffect glow className="max-w-5xl mx-auto bg-white">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-8">
                  {/* Cover Image */}
                  <div className="md:col-span-5 relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-[#F8F7F3] border border-[#E5E5E0] shadow-md group">
                    {latestMagazine.coverImageUrl ? (
                      <img
                        src={latestMagazine.coverImageUrl}
                        alt={latestMagazine.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#F8F7F3] flex flex-col justify-between p-6 text-center">
                        <div className="flex justify-between items-start">
                          <Badge variant="gold">{latestMagazine.year} Edition</Badge>
                          <span className="text-xs text-[#555555] font-mono">ANNUAL EDITION</span>
                        </div>
                        <div className="space-y-2 text-center my-auto">
                          <h4 className="font-serif text-2xl font-bold text-[#14532D] uppercase">{latestMagazine.title}</h4>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="gold">Latest Release</Badge>
                      <span className="text-xs text-[#555555] font-medium">Year {latestMagazine.year}</span>
                      {latestMagazine.pageCount && (
                        <span className="text-xs text-[#555555]">• {latestMagazine.pageCount} Pages</span>
                      )}
                    </div>

                    <H3 className="text-2xl sm:text-3xl text-[#14532D]">{latestMagazine.title}</H3>

                    {latestMagazine.description ? (
                      <Text className="text-[#555555]">{latestMagazine.description}</Text>
                    ) : (
                      <Text className="text-[#555555]">
                        Official yearly publication edition of KakatiyaPulse featuring editorial highlights and cultural documentation.
                      </Text>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <Link href="/magazines">
                        <Button variant="green" size="md" className="flex items-center gap-2 cursor-pointer">
                          <BookOpen className="w-4 h-4" /> Read Magazine
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="text-center py-16 bg-white border border-[#E5E5E0] rounded-2xl p-8 max-w-md mx-auto space-y-3 shadow-sm">
                <BookOpen className="w-10 h-10 text-[#C9A227] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#14532D]">No Editions Available</h3>
                <p className="text-xs text-[#555555]">Published magazine editions will appear here once released.</p>
              </div>
            )}
          </Container>
        </section>

        {/* VVIP PRESTIGE SPOTLIGHT */}
        <section className="py-24 bg-white border-b border-[#E5E5E0] relative overflow-hidden">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Prestige &amp; Distinction</SectionSubtitle>
                <H2 gradient>VVIP Spotlight</H2>
              </div>
              <Link href="/vvip" className="mt-4 md:mt-0 text-sm font-semibold text-[#14532D] hover:text-[#166534] hover:underline flex items-center gap-1">
                Explore VVIP Spotlight <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {vvipMembers.length === 0 ? (
              <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] rounded-2xl p-8 max-w-md mx-auto space-y-3 shadow-sm">
                <Crown className="w-10 h-10 text-[#C9A227] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#14532D]">No VVIP Features Published</h3>
                <p className="text-xs text-[#555555]">Featured VVIP profiles will appear here once released.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {vvipMembers.slice(0, 2).map((member) => (
                  <Card key={member.id} hoverEffect glow className="border-[#E5E5E0] bg-white p-2">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex justify-between items-start">
                        <Badge variant="vvip">{member.badge || "VVIP Prestige"}</Badge>
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-[#14532D]">{member.name}</h3>
                        <p className="text-sm text-[#C9A227] font-semibold mt-1">{member.designation}</p>
                      </div>
                      {member.quote && (
                        <p className="text-sm text-[#555555] italic border-l-2 border-[#C9A227] pl-4 py-1">
                          &ldquo;{member.quote}&rdquo;
                        </p>
                      )}
                      <div className="pt-2">
                        <Link href="/vvip">
                          <Button variant="green-outline" size="sm" className="w-full">
                            Read Detailed Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* EDITORIAL STORIES & MESSAGES */}
        <section className="py-20 bg-[#F8F7F3] border-b border-[#E5E5E0]">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Editorial Insights</SectionSubtitle>
                <H2 className="mt-2">Stories &amp; Messages</H2>
              </div>
              <Link href="/stories" className="mt-4 md:mt-0 text-sm font-semibold text-[#14532D] hover:text-[#166534] hover:underline flex items-center gap-1">
                Explore All Stories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {stories.length === 0 ? (
              <div className="text-center py-16 bg-white border border-[#E5E5E0] rounded-2xl p-8 max-w-md mx-auto space-y-3 shadow-sm">
                <FileText className="w-10 h-10 text-[#C9A227] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#14532D]">No Stories Published Yet</h3>
                <p className="text-xs text-[#555555]">Editorial messages and features will appear here once released.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stories.slice(0, 3).map((item) => (
                  <Card key={item.id} hoverEffect className="flex flex-col justify-between p-6 space-y-4 bg-white">
                    <div className="flex justify-between items-center text-xs">
                      <Badge variant="gold">{item.category || "Editorial"}</Badge>
                    </div>
                    <H3 className="text-lg font-bold text-[#14532D] line-clamp-2">{item.title}</H3>
                    <p className="text-sm text-[#555555] leading-relaxed line-clamp-3">{item.excerpt || item.content}</p>
                    <Link href="/stories" className="text-xs font-semibold text-[#14532D] hover:text-[#166534] transition-colors flex items-center gap-1 pt-2">
                      Read Full Story <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* VIP DIRECTORY PREVIEW */}
        <section className="py-20 bg-white border-b border-[#E5E5E0]">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Honored Members</SectionSubtitle>
                <H2 className="mt-2">VIP Directory</H2>
              </div>
              <Link href="/vip" className="mt-4 md:mt-0 text-sm font-semibold text-[#14532D] hover:text-[#166534] hover:underline flex items-center gap-1">
                View VIP Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {vipMembers.length === 0 ? (
              <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] rounded-2xl p-8 max-w-md mx-auto space-y-3 shadow-sm">
                <UserCheck className="w-10 h-10 text-[#C9A227] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-[#14532D]">No VIP Entries Published</h3>
                <p className="text-xs text-[#555555]">Verified VIP member profiles will appear here once published.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {vipMembers.slice(0, 4).map((vip) => (
                  <Card key={vip.id} hoverEffect className="text-center p-6 space-y-4 bg-white">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[#F8F7F3] border border-[#C9A227] flex items-center justify-center text-[#14532D] font-serif font-bold text-xl shadow-sm">
                      {vip.name.charAt(0) || "V"}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#1C1C1C]">{vip.name}</h4>
                      <p className="text-xs text-[#C9A227] font-semibold mt-1">{vip.designation}</p>
                    </div>
                    <Badge variant="vip">VIP Member</Badge>
                  </Card>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* ABOUT PUBLISHER OVERVIEW */}
        <section className="py-24 bg-[#F8F7F3] relative">
          <Container size="xl">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <SectionSubtitle>About Our Brand</SectionSubtitle>
              <H2 gradient>KakatiyaPulse</H2>
              <Text className="text-lg leading-relaxed text-[#555555]">
                KakatiyaPulse stands as an independent, premium editorial publication committed to journalistic integrity, cultural documentation, and high-impact digital magazines. We take pride in showcasing distinguished achievements and fostering inspiring narratives across regions.
              </Text>
              <div className="pt-4">
                <Link href="/about">
                  <Button variant="green-outline" size="md">
                    Learn More About Us
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
