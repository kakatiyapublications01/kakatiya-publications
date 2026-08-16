"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AdminGuard } from "@/components/admin/admin-guard";
import { useAuth } from "@/context/auth-context";
import { Container } from "@/components/ui/container";
import { H1, H2, SectionSubtitle, Text } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      {/* Top Admin Header Bar */}
      <header className="bg-[#0d0d12] border-b border-[#d4af37]/20 py-4">
        <Container size="xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="relative w-40 h-10 block">
                <Image src="/logo.svg" alt="Kakatiya" fill className="object-contain" />
              </Link>
              <Badge variant="vvip">Admin Console</Badge>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-400">
                Logged in as <strong className="text-amber-200">{user?.email}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-12">
        <Container size="xl" className="space-y-10">
          <div>
            <SectionSubtitle>Management Hub</SectionSubtitle>
            <H1 gradient className="text-3xl sm:text-4xl mt-1">
              Editorial Control Center
            </H1>
            <Text className="text-zinc-400 mt-1">
              Manage digital magazines, editorial stories, VVIP spotlights, VIP directory entries, and system settings.
            </Text>
          </div>

          {/* Quick Module Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Magazines",
                desc: "Upload PDFs, edit month/year, cover images, and publish status.",
                badge: "PDF Flipbook System",
                link: "/admin/magazines",
              },
              {
                title: "Stories & Messages",
                desc: "Create editorial writeups, category tags, and leader messages.",
                badge: "Content Desk",
                link: "/admin/stories",
              },
              {
                title: "VVIP Spotlight",
                desc: "Manage high-hierarchy prestige profiles and featured quotes.",
                badge: "Prestige Section",
                link: "/admin/vvip",
              },
              {
                title: "VIP Directory",
                desc: "Update community VIP members, designations, and ordering.",
                badge: "Member Directory",
                link: "/admin/vip",
              },
            ].map((mod, i) => (
              <Card key={i} hoverEffect glow className="p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant="gold">{mod.badge}</Badge>
                  </div>
                  <H2 className="text-xl">{mod.title}</H2>
                  <p className="text-xs text-zinc-400 leading-relaxed">{mod.desc}</p>
                </div>
                <div className="pt-6">
                  <Link href={mod.link}>
                    <Button variant="gold-outline" size="sm" className="w-full">
                      Open Module
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Security Status Box */}
          <Card className="p-6 border-[#d4af37]/30 bg-[#121217]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h4 className="font-serif text-lg font-bold text-white">Firebase Security Rules Active</h4>
                </div>
                <p className="text-xs text-zinc-400">
                  Authoritative custom claims check (<code className="text-amber-300">token.admin == true</code>) enforced across Firestore database and Cloud Storage.
                </p>
              </div>

              <Badge variant="success">Secured</Badge>
            </div>
          </Card>
        </Container>
      </main>
    </div>
  );
}
