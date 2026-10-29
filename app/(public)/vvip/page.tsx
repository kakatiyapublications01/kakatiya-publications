import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { EditorialHeader } from "@/components/ui/typography";
import { getPublishedVvipMembers } from "@/lib/firebase/vvip";
import { pageMetadata } from "@/lib/seo";
import { Crown } from "lucide-react";

export const metadata = pageMetadata({
  title: "VVIP Spotlight",
  description: "Prestigious VVIP profile features and leader spotlights from KakatiyaPulse.",
  path: "/vvip",
});

export const revalidate = 60;

export default async function VvipPage() {
  const vvipMembers = await getPublishedVvipMembers();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl">
          <EditorialHeader
            title="VVIP Spotlight"
            subtitle="Prestige &amp; Distinction"
          />

          {vvipMembers.length === 0 ? (
            <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] p-10 max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 border border-[#C9A227] flex items-center justify-center mx-auto text-[#14532D]">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14532D] uppercase tracking-wide">
                No VVIP Features Published
              </h3>
              <p className="text-xs text-[#555555]">
                Exclusive VVIP spotlight features will appear here once officially documented by the editorial board.
              </p>
            </div>
          ) : (
            <div className="space-y-16 max-w-5xl mx-auto">
              {vvipMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="pb-16 border-b border-[#E5E5E0] last:border-b-0 last:pb-0"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                    {/* Large Feature Portrait (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="relative aspect-[3/4] w-full bg-[#F8F7F3] border border-[#E5E5E0] magazine-shadow overflow-hidden">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif text-5xl text-[#14532D]">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Portrait Caption */}
                      <div className="text-center sm:text-left space-y-1 border-t border-[#E5E5E0] pt-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C9A227] block">
                          Official Editorial Portrait
                        </span>
                        <span className="text-xs font-serif italic text-[#555555]">
                          KakatiyaPulse Prestige Archives
                        </span>
                      </div>
                    </div>

                    {/* Editorial Content (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 bg-[#14532D] text-white">
                            VVIP FEATURE
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
                            {member.badge || "Prestige Distinction"}
                          </span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14532D] tracking-tight leading-tight">
                          {member.name}
                        </h2>

                        {member.designation && (
                          <p className="text-sm sm:text-base font-semibold text-[#1C1C1C] uppercase tracking-wider">
                            {member.designation}
                          </p>
                        )}
                      </div>

                      <div className="h-[2px] w-16 bg-[#C9A227]" />

                      {member.quote && (
                        <blockquote className="font-serif italic text-lg sm:text-xl text-[#1C1C1C] border-l-2 border-[#14532D] pl-4 leading-relaxed">
                          &ldquo;{member.quote}&rdquo;
                        </blockquote>
                      )}

                      {member.bio && (
                        <div className="text-sm text-[#555555] leading-relaxed space-y-3 font-sans">
                          {member.bio.split("\n\n").map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      )}

                      {/* Dossier details */}
                      <div className="pt-4 border-t border-[#E5E5E0] grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="block uppercase text-[10px] text-[#555555] font-semibold tracking-wider">
                            Category
                          </span>
                          <span className="font-medium text-[#1C1C1C]">Leadership &amp; Distinction</span>
                        </div>
                        <div>
                          <span className="block uppercase text-[10px] text-[#555555] font-semibold tracking-wider">
                            Archive Status
                          </span>
                          <span className="font-medium text-[#14532D]">Permanent Profile Record</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
