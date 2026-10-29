import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { EditorialHeader } from "@/components/ui/typography";
import { getPublishedVipMembers } from "@/lib/firebase/vip";
import { pageMetadata } from "@/lib/seo";
import { MapPin, UserCheck } from "lucide-react";

export const metadata = pageMetadata({
  title: "VIP Directory",
  description: "Distinguished VIP member publication directory from KakatiyaPulse.",
  path: "/vip",
});

export const revalidate = 60;

export default async function VipPage() {
  const vipMembers = await getPublishedVipMembers();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <Container size="xl">
          <EditorialHeader
            title="VIP Directory"
            subtitle="The Community Roll of Honor"
          />

          {vipMembers.length === 0 ? (
            <div className="text-center py-16 bg-[#F8F7F3] border border-[#E5E5E0] p-10 max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 border border-[#C9A227] flex items-center justify-center mx-auto text-[#14532D]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#14532D] uppercase tracking-wide">
                No VIP Entries Published
              </h3>
              <p className="text-xs text-[#555555]">
                Official VIP directory profiles will appear here once verified and published by the editorial board.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-[#E5E5E0] pt-8">
              {vipMembers.map((vip) => (
                <div
                  key={vip.id}
                  className="flex gap-5 pb-8 border-b border-[#E5E5E0]"
                >
                  {/* Portrait (Rectangular print portrait) */}
                  <div className="w-24 sm:w-28 aspect-[3/4] shrink-0 bg-[#F8F7F3] border border-[#E5E5E0] overflow-hidden flex items-center justify-center font-serif text-2xl text-[#14532D]">
                    {vip.imageUrl ? (
                      <img
                        src={vip.imageUrl}
                        alt={vip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      vip.name.charAt(0) || "V"
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A227]">
                      Honored Member
                    </span>

                    <h3 className="font-serif text-lg font-bold text-[#1C1C1C] leading-snug truncate">
                      {vip.name}
                    </h3>

                    {vip.designation && (
                      <p className="text-xs font-semibold text-[#14532D] uppercase tracking-wider line-clamp-1">
                        {vip.designation}
                      </p>
                    )}

                    {vip.location && (
                      <p className="text-[11px] text-[#555555] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C9A227] shrink-0" />
                        <span>{vip.location}</span>
                      </p>
                    )}

                    {vip.bio && (
                      <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed pt-1">
                        {vip.bio}
                      </p>
                    )}
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
