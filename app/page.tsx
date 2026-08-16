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

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden border-b border-zinc-800/60">
          {/* Gold Glowing Radial Background Overlay */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#d4af37]/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#eab308]/5 blur-[100px] rounded-full pointer-events-none" />

          <Container size="xl" className="relative z-10 text-center">
            <div className="max-w-4xl mx-auto space-y-6">
              <SectionSubtitle className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                Independent Editorial Publishing
              </SectionSubtitle>

              <H1 gradient className="leading-tight sm:leading-tight">
                Kakatiya Publications
              </H1>

              <p className="font-serif text-xl sm:text-2xl text-zinc-300 font-normal italic tracking-wide max-w-2xl mx-auto">
                “Celebrating Excellence, Preserving Legacy, and Documenting History”
              </p>

              <Text className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Welcome to the official digital portal of Kakatiya Publications. Discover our high-definition flipbook magazines, prestigious VVIP spotlights, VIP directories, and exclusive editorial messages.
              </Text>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Link href="/magazines">
                  <Button variant="gold" size="lg">
                    Explore Magazines
                  </Button>
                </Link>
                <Link href="/vvip">
                  <Button variant="gold-outline" size="lg">
                    VVIP Spotlight
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* LATEST MAGAZINE EDITION */}
        <section className="py-20 bg-[#0d0d12] border-b border-zinc-800/60 relative">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Current Edition</SectionSubtitle>
                <H2 className="mt-2">Latest Magazine</H2>
              </div>
              <Link href="/magazines" className="mt-4 md:mt-0 text-sm font-medium text-[#d4af37] hover:underline flex items-center gap-1">
                View All Editions →
              </Link>
            </div>

            <Card hoverEffect glow className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-6 sm:p-8">
                {/* Cover Image Container */}
                <div className="md:col-span-5 relative aspect-[3/4] w-full rounded-md overflow-hidden bg-zinc-900 border border-[#d4af37]/30 shadow-2xl group">
                  {/* Decorative Cover Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start">
                      <Badge variant="gold">August 2026</Badge>
                      <span className="text-xs text-zinc-500 font-mono">EDITION #48</span>
                    </div>

                    <div className="space-y-2 text-center my-auto">
                      <div className="relative w-20 h-20 mx-auto opacity-80">
                        <Image src="/kakatiya-emblem.svg" alt="Crest" fill className="object-contain" />
                      </div>
                      <h4 className="font-serif text-2xl font-bold text-amber-200">KAKATIYA</h4>
                      <p className="text-xs tracking-widest text-zinc-400 uppercase">MONTHLY MAGAZINE</p>
                    </div>

                    <div className="border-t border-[#d4af37]/20 pt-3 text-center">
                      <p className="text-xs text-amber-100/80 font-serif italic">Special VVIP Leadership Feature Edition</p>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-zinc-950/90 text-amber-200 text-xs font-semibold px-4 py-2 rounded-full border border-[#d4af37]/50 shadow-xl">
                      Open Flipbook Reader
                    </span>
                  </div>
                </div>

                {/* Details Column */}
                <div className="md:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="gold">Latest Release</Badge>
                    <span className="text-xs text-zinc-400">Published August 2026</span>
                    <span className="text-xs text-zinc-500">• 64 Pages</span>
                  </div>

                  <H3 className="text-2xl sm:text-3xl">August 2026 Special Edition</H3>

                  <Text className="text-zinc-300">
                    Featuring exclusive interviews with leading industry pioneers, regional visionary spotlights, cultural heritage documentation, and inspiring message stories.
                  </Text>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link href="/magazines">
                      <Button variant="gold" size="md">
                        Read Magazine
                      </Button>
                    </Link>
                    <Link href="/magazines">
                      <Button variant="glass" size="md">
                        Browse Archive
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </Container>
        </section>

        {/* VVIP PRESTIGE SPOTLIGHT */}
        <section className="py-24 bg-[#09090b] border-b border-zinc-800/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

          <Container size="xl">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <SectionSubtitle>Prestige & Distinction</SectionSubtitle>
              <H2 gradient>VVIP Spotlight</H2>
              <Text>
                Honoring distinguished figures of exceptional accomplishment, leadership, and public influence.
              </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* VVIP Feature Card 1 */}
              <Card hoverEffect glow className="border-[#d4af37]/30 bg-[#121217]">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge variant="vvip">VVIP Prestige</Badge>
                    <span className="text-xs text-amber-500/80 font-serif italic">Featured Leader</span>
                  </div>

                  <div className="aspect-[4/3] w-full rounded-md overflow-hidden bg-zinc-900 relative border border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent flex flex-col justify-end p-6">
                      <h3 className="font-serif text-2xl font-bold text-white">Dr. K. Ramachandra Rao</h3>
                      <p className="text-sm text-[#d4af37] font-medium">Visionary Entrepreneur & Philanthropist</p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 italic border-l-2 border-[#d4af37] pl-4 py-1">
                    “True leadership lies in empowering generations and preserving our core cultural heritage.”
                  </p>

                  <div className="pt-2">
                    <Link href="/vvip">
                      <Button variant="gold-outline" size="sm" className="w-full">
                        Read Detailed Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* VVIP Feature Card 2 */}
              <Card hoverEffect glow className="border-[#d4af37]/30 bg-[#121217]">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <Badge variant="vvip">VVIP Prestige</Badge>
                    <span className="text-xs text-amber-500/80 font-serif italic">Patron of Excellence</span>
                  </div>

                  <div className="aspect-[4/3] w-full rounded-md overflow-hidden bg-zinc-900 relative border border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent flex flex-col justify-end p-6">
                      <h3 className="font-serif text-2xl font-bold text-white">Smt. Vijayalakshmi Devi</h3>
                      <p className="text-sm text-[#d4af37] font-medium">Cultural Ambassador & Educationist</p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 italic border-l-2 border-[#d4af37] pl-4 py-1">
                    “Knowledge and tradition are the twin pillars of any thriving publication and society.”
                  </p>

                  <div className="pt-2">
                    <Link href="/vvip">
                      <Button variant="gold-outline" size="sm" className="w-full">
                        Read Detailed Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>

        {/* EDITORIAL STORIES & MESSAGES */}
        <section className="py-20 bg-[#0d0d12] border-b border-zinc-800/60">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Editorial Insights</SectionSubtitle>
                <H2 className="mt-2">Stories & Messages</H2>
              </div>
              <Link href="/stories" className="mt-4 md:mt-0 text-sm font-medium text-[#d4af37] hover:underline">
                Explore All Stories →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              ].map((item, idx) => (
                <Card key={idx} hoverEffect className="flex flex-col justify-between">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex justify-between items-center text-xs">
                      <Badge variant="gold">{item.category}</Badge>
                      <span className="text-zinc-500">{item.date}</span>
                    </div>

                    <H3 className="text-lg font-bold line-clamp-2 hover:text-[#d4af37] transition-colors cursor-pointer">
                      {item.title}
                    </H3>

                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                      {item.excerpt}
                    </p>
                  </CardContent>

                  <div className="px-6 pb-6 pt-2">
                    <Link href="/stories" className="text-xs font-semibold text-[#d4af37] hover:text-white transition-colors flex items-center gap-1">
                      Read Full Story →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* VIP DIRECTORY PREVIEW */}
        <section className="py-20 bg-[#09090b] border-b border-zinc-800/60">
          <Container size="xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <SectionSubtitle>Honored Members</SectionSubtitle>
                <H2 className="mt-2">VIP Directory</H2>
              </div>
              <Link href="/vip" className="mt-4 md:mt-0 text-sm font-medium text-[#d4af37] hover:underline">
                View VIP Directory →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Sri M. Venkat Rao", role: "Industrialist & Patron" },
                { name: "Dr. S. Anuradha", role: "Chief Medical Director" },
                { name: "Sri P. Narsimha Reddy", role: "Education Trustee" },
                { name: "Smt. G. Rajeshwari", role: "Social Entrepreneur" },
              ].map((vip, i) => (
                <Card key={i} hoverEffect className="text-center p-6 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 border border-[#d4af37]/40 flex items-center justify-center text-amber-200 font-serif font-bold text-xl shadow-inner">
                    {vip.name.charAt(4) || "V"}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-white">{vip.name}</h4>
                    <p className="text-xs text-amber-400/90 font-medium mt-1">{vip.role}</p>
                  </div>
                  <Badge variant="vip">VIP Member</Badge>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ABOUT PUBLISHER OVERVIEW */}
        <section className="py-24 bg-[#0d0d12] relative">
          <Container size="xl">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <SectionSubtitle>About Our Brand</SectionSubtitle>
              <H2 gradient>Kakatiya Publications</H2>
              <Text className="text-lg leading-relaxed text-zinc-300">
                Kakatiya Publications stands as an independent, premium editorial publishing house committed to journalistic integrity, cultural documentation, and high-impact digital magazines. We take pride in showcasing distinguished achievements and fostering inspiring narratives across regions.
              </Text>
              <div className="pt-4">
                <Link href="/about">
                  <Button variant="gold-outline" size="md">
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
