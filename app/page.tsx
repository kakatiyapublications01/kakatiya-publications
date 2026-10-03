import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, SectionSubtitle, Text, EditorialHeader } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveVisitorCount } from "@/components/live-visitor-count";
import { getPublishedMagazines } from "@/lib/firebase/magazines";
import { getPublishedVvipMembers } from "@/lib/firebase/vvip";
import { getPublishedStories } from "@/lib/firebase/stories";
import { getPublishedVipMembers } from "@/lib/firebase/vip";
import { getPublishedAnnouncements } from "@/lib/firebase/announcements";
import { TeluguAnnouncements } from "@/components/ui/telugu-announcements";

import { HeroScrollDemo } from "@/components/container-scroll-animation-demo";
import KakatiyaPulseSplash from "@/components/ui/sparkles-fullpage-demo";
import {
  BookOpen,
  ArrowRight,
  Calendar,
  MapPin,
  FileText,
  Crown,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [magazines, vvipMembers, stories, vipMembers, announcements] = await Promise.all([
    getPublishedMagazines().catch(() => []),
    getPublishedVvipMembers().catch(() => []),
    getPublishedStories().catch(() => []),
    getPublishedVipMembers().catch(() => []),
    getPublishedAnnouncements().catch(() => []),
  ]);

  // Select the magazine marked as featured, fallback to latest published
  const heroMagazine =
    magazines.find((m) => Boolean(m.featured)) ||
    (magazines.length > 0 ? magazines[0] : null);
  const leadStory = stories.length > 0 ? stories[0] : null;
  const secondaryStories = stories.slice(1, 4);
  const featuredVvip = vvipMembers.length > 0 ? vvipMembers[0] : null;
  const featuredVips = vipMembers.slice(0, 4);

  const todayDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const plainMagazine = heroMagazine
    ? {
        id: heroMagazine.id,
        title: heroMagazine.title || "",
        year: heroMagazine.year || 2026,
        month: heroMagazine.month || "",
        pdfUrl: heroMagazine.pdfUrl || "",
        coverImageUrl: heroMagazine.coverImageUrl || "",
        description: heroMagazine.description || "",
        pageCount: heroMagazine.pageCount || heroMagazine.pages || 64,
        featured: Boolean(heroMagazine.featured),
        status: (heroMagazine.status || "published") as "published" | "draft" | "archived",
        createdAt: typeof heroMagazine.createdAt === "string" ? heroMagazine.createdAt : "",
        updatedAt: typeof heroMagazine.updatedAt === "string" ? heroMagazine.updatedAt : "",
      }
    : null;

  const plainStories = stories.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug || "",
    category: s.category || "Feature",
    excerpt: s.excerpt || "",
    date: s.date || "",
  }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Editorial Particle Intro Splash Overlay */}
      <KakatiyaPulseSplash />

      <Header />

      <main className="flex-1">
        {/* 1. EDITORIAL DATELINE BAR */}
        <section className="bg-[#F8F7F3] border-b border-[#E5E5E0] py-2">
          <Container size="xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#555555] font-serif italic">
                  {todayDate} — <strong className="font-semibold not-italic text-[#14532D]">Digital Edition</strong>
                </span>
              </div>
              <div className="flex items-center gap-4 text-[#555555]">
                <span className="hidden md:inline font-mono text-[11px]">
                  SPECIAL ISSUE • VOL. IV
                </span>
                <span className="text-[#E5E5E0] hidden md:inline">|</span>
                <LiveVisitorCount />
              </div>
            </div>
          </Container>
        </section>

        {/* HERO SCROLL ANIMATION */}
        <HeroScrollDemo magazine={plainMagazine} stories={plainStories} />

        {/* 2. MAIN FEATURE: SPECIAL EDITION SPREAD */}
        <section className="py-12 sm:py-16 border-b border-[#E5E5E0] bg-white">
          <Container size="xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* SIDE A: Large Magazine Cover (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4] bg-[#F8F7F3] border border-[#E5E5E0] magazine-shadow magazine-shadow-hover overflow-hidden">
                  {heroMagazine?.coverImageUrl ? (
                    <img
                      src={heroMagazine.coverImageUrl}
                      alt={heroMagazine.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col justify-between border-4 border-[#14532D]/20 bg-[#F8F7F3]">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A227] font-bold">
                          KakatiyaPulse Official
                        </p>
                        <h3 className="font-serif text-3xl font-black text-[#14532D] mt-2 uppercase">
                          {heroMagazine?.year || "2026"}
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-[#555555] mt-1">
                          Special Edition
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="h-[1px] w-12 bg-[#C9A227]" />
                        <p className="font-serif italic text-sm text-[#1C1C1C]">
                          A Definitive Chronicle of Community Excellence
                        </p>
                      </div>
                      <div className="text-[10px] text-[#555555] font-mono border-t border-[#E5E5E0] pt-2">
                        Digital Flipbook Edition
                      </div>
                    </div>
                  )}

                  {/* Corner Edition Tag */}
                  <div className="absolute top-0 right-0 bg-[#14532D] text-[#F8F7F3] text-[10px] uppercase font-bold tracking-widest px-3 py-1 border-b border-l border-[#C9A227]">
                    {heroMagazine?.year ? `${heroMagazine.year} Edition` : "Special Edition"}
                  </div>
                </div>

                {/* Cover Footnote Metadata */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-[#555555] font-mono">
                    {heroMagazine?.pageCount ? `${heroMagazine.pageCount} Pages • ` : ""}
                    High-Definition Interactive Flipbook
                  </p>
                </div>
              </div>

              {/* SIDE B: Editorial Headline & Overview (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                      SPECIAL EDITION
                    </span>
                    <span className="text-[#E5E5E0]">•</span>
                    <span className="text-[11px] font-mono text-[#555555] uppercase">
                      {heroMagazine?.year ? `Year ${heroMagazine.year}` : "Current Issue"}
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14532D] tracking-tight leading-[1.15]">
                    {heroMagazine?.title || "Celebrating Excellence, Preserving Legacy, and Documenting History"}
                  </h2>
                </div>

                <div className="h-[2px] w-20 bg-[#C9A227]" />

                <blockquote className="font-serif italic text-lg sm:text-xl text-[#1C1C1C] font-normal leading-relaxed border-l-2 border-[#14532D] pl-4">
                  &ldquo;A serious editorial chronicle dedicated to cultural heritage, eminent personalities, and the inspiring progress of our community.&rdquo;
                </blockquote>

                <p className="text-[#555555] text-sm sm:text-base leading-relaxed">
                  {heroMagazine?.description ||
                    "Explore our official digital edition, formatted as a double-page physical flipbook. Featuring comprehensive cover stories, in-depth photo galleries, VVIP spotlights, and exclusive community perspectives."}
                </p>

                {/* Primary CTA Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link href="/magazines">
                    <Button variant="green" size="lg" className="gap-2 cursor-pointer">
                      <BookOpen className="w-4 h-4" />
                      <span>Read Special Edition</span>
                    </Button>
                  </Link>

                  <Link href="/magazines">
                    <Button variant="green-outline" size="lg" className="cursor-pointer">
                      Explore All Archives
                    </Button>
                  </Link>
                </div>

                {/* Editorial Metadata Table */}
                <div className="pt-4 border-t border-[#E5E5E0] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="block uppercase text-[10px] text-[#555555] font-semibold tracking-wider">
                      Format
                    </span>
                    <span className="font-medium text-[#1C1C1C]">Interactive Flipbook</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[10px] text-[#555555] font-semibold tracking-wider">
                      Language
                    </span>
                    <span className="font-medium text-[#1C1C1C]">English / Telugu</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[10px] text-[#555555] font-semibold tracking-wider">
                      Access
                    </span>
                    <span className="font-medium text-[#14532D]">Open Public Archive</span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* TELUGU ANNOUNCEMENTS & OFFICIAL UPDATES */}
        <TeluguAnnouncements announcements={announcements} />

        {/* 3. LATEST STORIES & COLUMNS (Newspaper Broadsheet Grid) */}
        <section className="py-14 sm:py-16 border-b border-[#E5E5E0] bg-white">
          <Container size="xl">
            <EditorialHeader
              title="Latest Stories"
              subtitle="Editorial Dispatch &amp; Articles"
              action={
                <Link
                  href="/stories"
                  className="text-xs uppercase font-bold tracking-wider text-[#14532D] hover:text-[#C9A227] flex items-center gap-1"
                >
                  View All Stories <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {stories.length === 0 ? (
              <div className="py-12 px-6 border border-[#E5E5E0] bg-[#F8F7F3] text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#14532D]">
                  No Stories Published Yet
                </p>
                <p className="text-xs text-[#555555]">
                  The editorial desk has not released articles for this publishing cycle.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Lead Story (7 cols) */}
                {leadStory && (
                  <div className="lg:col-span-7 space-y-4 pb-6 lg:pb-0 lg:border-r lg:border-[#E5E5E0] lg:pr-10">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[#C9A227]">
                        Lead Story
                      </span>
                      {leadStory.category && (
                        <>
                          <span className="text-[#E5E5E0]">•</span>
                          <span className="text-[#555555] uppercase text-[11px] font-semibold">
                            {leadStory.category}
                          </span>
                        </>
                      )}
                      {leadStory.createdAt && (
                        <>
                          <span className="text-[#E5E5E0]">•</span>
                          <span className="text-[#555555] font-mono text-[11px]">
                            {new Date(leadStory.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C] hover:text-[#14532D] transition-colors leading-tight">
                      <Link href="/stories">{leadStory.title}</Link>
                    </h3>

                    <p className="text-[#555555] text-sm sm:text-base leading-relaxed">
                      {leadStory.excerpt || leadStory.content}
                    </p>

                    <div className="pt-2">
                      <Link
                        href="/stories"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#14532D] hover:text-[#C9A227]"
                      >
                        Read Full Story <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Secondary Stories Column (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  {secondaryStories.length > 0 ? (
                    secondaryStories.map((story, idx) => (
                      <div
                        key={story.id || idx}
                        className="space-y-2 pb-6 border-b border-[#E5E5E0] last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-bold uppercase tracking-wider text-[#C9A227]">
                            {story.category || "Dispatch"}
                          </span>
                          {story.createdAt && (
                            <>
                              <span className="text-[#E5E5E0]">•</span>
                              <span className="text-[#555555] font-mono">
                                {new Date(story.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className="font-serif text-lg font-bold text-[#1C1C1C] hover:text-[#14532D] transition-colors leading-snug">
                          <Link href="/stories">{story.title}</Link>
                        </h4>

                        <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                          {story.excerpt || story.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 bg-[#F8F7F3] border border-[#E5E5E0]">
                      <p className="font-serif text-sm font-bold text-[#14532D]">
                        Editorial Note
                      </p>
                      <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                        KakatiyaPulse delivers quarterly editorial columns and community features.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Container>
        </section>

        {/* 4. VVIP PRESTIGE & VIP GAZETTE */}
        <section className="py-14 sm:py-16 border-b border-[#E5E5E0] bg-[#F8F7F3]">
          <Container size="xl">
            <EditorialHeader
              title="VVIP & VIP Gazette"
              subtitle="Honoring Leadership &amp; Distinction"
            />

            {/* VVIP Feature Banner (if present) */}
            {featuredVvip && (
              <div className="bg-white border border-[#E5E5E0] p-6 sm:p-10 mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-4 flex justify-center">
                    <div className="relative w-48 sm:w-56 aspect-[4/5] bg-[#F8F7F3] border border-[#E5E5E0] overflow-hidden">
                      {featuredVvip.imageUrl ? (
                        <img
                          src={featuredVvip.imageUrl}
                          alt={featuredVvip.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-[#14532D]">
                          {featuredVvip.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 bg-[#14532D] text-white">
                        VVIP Spotlight
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
                        {featuredVvip.badge || "Distinguished Icon"}
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#14532D]">
                      {featuredVvip.name}
                    </h3>

                    {featuredVvip.designation && (
                      <p className="text-sm font-semibold uppercase tracking-wider text-[#555555]">
                        {featuredVvip.designation}
                      </p>
                    )}

                    {featuredVvip.quote && (
                      <blockquote className="font-serif italic text-base sm:text-lg text-[#1C1C1C] border-l-2 border-[#C9A227] pl-4">
                        &ldquo;{featuredVvip.quote}&rdquo;
                      </blockquote>
                    )}

                    {featuredVvip.bio && (
                      <p className="text-sm text-[#555555] line-clamp-3 leading-relaxed">
                        {featuredVvip.bio}
                      </p>
                    )}

                    <div className="pt-2">
                      <Link
                        href="/vvip"
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#14532D] hover:text-[#C9A227]"
                      >
                        View Full VVIP Profile <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIP Directory Row */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#14532D]">
                  VIP Directory Profiles
                </h4>
                <Link
                  href="/vip"
                  className="text-xs uppercase font-bold tracking-wider text-[#14532D] hover:text-[#C9A227] flex items-center gap-1"
                >
                  Browse Full Directory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {featuredVips.length === 0 ? (
                <div className="p-8 bg-white border border-[#E5E5E0] text-center text-xs text-[#555555]">
                  VIP profiles will be published after editorial review.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredVips.map((vip) => (
                    <div
                      key={vip.id}
                      className="bg-white border border-[#E5E5E0] p-4 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-none bg-[#F8F7F3] border border-[#E5E5E0] overflow-hidden flex items-center justify-center font-serif font-bold text-[#14532D]">
                        {vip.imageUrl ? (
                          <img
                            src={vip.imageUrl}
                            alt={vip.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          vip.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-serif text-sm font-bold text-[#1C1C1C] truncate">
                          {vip.name}
                        </h5>
                        {vip.designation && (
                          <p className="text-[11px] text-[#555555] truncate">{vip.designation}</p>
                        )}
                        {vip.location && (
                          <p className="text-[10px] text-[#C9A227] uppercase tracking-wider truncate">
                            {vip.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* 5. PUBLICATION MISSION & CREED */}
        <section className="py-14 bg-white">
          <Container size="xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-b border-[#E5E5E0] py-10">
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                  Heritage
                </p>
                <h4 className="font-serif text-xl font-bold text-[#14532D]">
                  Cultural Preservation
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Documenting the historic journey, achievements, and living history of distinguished community figures for generations to come.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                  Editorial Craft
                </p>
                <h4 className="font-serif text-xl font-bold text-[#14532D]">
                  Print &amp; Digital Fusion
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Combining the timeless gravitas of physical magazines with high-resolution digital flipbooks readable anywhere on any screen.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                  Integrity
                </p>
                <h4 className="font-serif text-xl font-bold text-[#14532D]">
                  Independent Press
                </h4>
                <p className="text-xs text-[#555555] leading-relaxed">
                  An autonomous publication operating with editorial rigor, professional fact verification, and respect for community leadership.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
