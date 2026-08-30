"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { collection, query, getDocs } from "firebase/firestore";
import { db, auth as firebaseAuth } from "@/lib/firebase/config";
import { getAllMagazinesAdmin } from "@/lib/firebase/magazines";
import { getAllStoriesAdmin } from "@/lib/firebase/stories";
import { getAllVipMembersAdmin } from "@/lib/firebase/vip";
import { getAllVvipMembersAdmin } from "@/lib/firebase/vvip";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  UserCheck,
  Crown,
  BarChart3,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

interface DashboardStats {
  magazinesPublished: number;
  magazinesDraft: number;
  storiesPublished: number;
  storiesDraft: number;
  vipCount: number;
  vvipCount: number;
  liveVisitors: number;
  visitorsToday: number;
  visitorsThisMonth: number;
  returningVisitors: number;
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<{ label: string; time: string; type: string }[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        // Refresh token to ensure admin claim is present for client-side Firestore reads
        if (firebaseAuth.currentUser) {
          try { await firebaseAuth.currentUser.getIdToken(true); } catch (e) { /* ignore */ }
        }
        const [magazines, stories, vip, vvip, visitorsSnap] = await Promise.all([
          getAllMagazinesAdmin().catch(() => []),
          getAllStoriesAdmin().catch(() => []),
          getAllVipMembersAdmin().catch(() => []),
          getAllVvipMembersAdmin().catch(() => []),
          getDocs(query(collection(db, "visitors"))).catch(() => ({ forEach: () => {} } as any)),
        ]);

        const pubMags = magazines.filter((m) => m.status === "published");
        const draftMags = magazines.filter((m) => m.status === "draft");
        const pubStories = stories.filter((s) => s.status === "published");
        const draftStories = stories.filter((s) => s.status === "draft");

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let visitorsToday = 0;
        let visitorsThisMonth = 0;
        let returningVisitors = 0;

        visitorsSnap.forEach((doc: any) => {
          const data = doc.data();
          const createdAt = new Date(data.createdAt || 0).getTime();
          const lastVisitAt = new Date(data.lastVisitAt || createdAt).getTime();

          if (lastVisitAt >= startOfToday) visitorsToday++;
          if (lastVisitAt >= startOfMonth) visitorsThisMonth++;
          if (lastVisitAt - createdAt > 1000 * 60 * 60 * 24) returningVisitors++;
        });

        setStats({
          magazinesPublished: pubMags.length,
          magazinesDraft: draftMags.length,
          storiesPublished: pubStories.length,
          storiesDraft: draftStories.length,
          vipCount: vip.length,
          vvipCount: vvip.length,
          liveVisitors: 0,
          visitorsToday,
          visitorsThisMonth,
          returningVisitors,
        });

        // Build recent activity from real data
        const activity: { label: string; time: string; type: string }[] = [];
        magazines.slice(0, 2).forEach((m) => {
          activity.push({
            label: `Magazine: ${m.title}`,
            time: m.updatedAt || m.createdAt || "",
            type: "magazine",
          });
        });
        stories.slice(0, 2).forEach((s) => {
          activity.push({
            label: `Story: ${s.title}`,
            time: s.updatedAt || s.createdAt || "",
            type: "story",
          });
        });
        activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivity(activity.slice(0, 5));
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    }

    // Also fetch live count
    async function loadLiveCount() {
      try {
        const res = await fetch("/api/live-sessions");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => prev ? { ...prev, liveVisitors: data.count || 0 } : prev);
        }
      } catch {
        // Non-critical
      }
    }

    loadStats();
    loadLiveCount();
  }, []);

  const statCards = [
    {
      label: "Published Magazines",
      value: stats?.magazinesPublished,
      icon: <BookOpen className="w-5 h-5" />,
      href: "/admin/magazines",
      color: "text-[#14532D]",
      bg: "bg-[#14532D]/5",
    },
    {
      label: "Draft Magazines",
      value: stats?.magazinesDraft,
      icon: <BookOpen className="w-5 h-5" />,
      href: "/admin/magazines",
      color: "text-[#C9A227]",
      bg: "bg-[#C9A227]/5",
    },
    {
      label: "Published Stories",
      value: stats?.storiesPublished,
      icon: <FileText className="w-5 h-5" />,
      href: "/admin/stories",
      color: "text-[#14532D]",
      bg: "bg-[#14532D]/5",
    },
    {
      label: "Draft Stories",
      value: stats?.storiesDraft,
      icon: <FileText className="w-5 h-5" />,
      href: "/admin/stories",
      color: "text-[#C9A227]",
      bg: "bg-[#C9A227]/5",
    },
    {
      label: "VIP Profiles",
      value: stats?.vipCount,
      icon: <UserCheck className="w-5 h-5" />,
      href: "/admin/vip",
      color: "text-[#166534]",
      bg: "bg-[#166534]/5",
    },
    {
      label: "VVIP Profiles",
      value: stats?.vvipCount,
      icon: <Crown className="w-5 h-5" />,
      href: "/admin/vvip",
      color: "text-[#C9A227]",
      bg: "bg-[#C9A227]/5",
    },
  ];

  return (
    <AdminLayout pageTitle="Editorial Dashboard">
      {/* Welcome Banner */}
      <div className="mb-8">
        <div className="h-[2px] w-12 bg-[#C9A227] mb-4" />
        <h2 className="font-serif text-2xl font-bold text-[#14532D]">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
        </h2>
        <p className="text-[#555555] text-sm mt-1">
          Manage KakatiyaPulse editorial content, publications, and member profiles.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group bg-white border border-[#E5E5E0] rounded-xl p-5 flex items-start gap-4 hover:border-[#C9A227] hover:shadow-md transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color} shrink-0`}>
              {card.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#555555] font-medium mb-1 leading-tight">{card.label}</p>
              {loading ? (
                <div className="h-6 w-12 bg-[#E5E5E0] rounded animate-pulse" />
              ) : (
                <p className={`font-serif text-2xl font-bold ${card.color}`}>
                  {card.value ?? "—"}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#C9A227]" />
              <h3 className="font-serif text-base font-bold text-[#14532D]">Audience Overview</h3>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-[#F8F7F3] rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F7F3] p-3 rounded-lg border border-[#E5E5E0]">
                  <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Visitors Today</p>
                  <p className="font-serif text-xl font-bold text-[#14532D]">{stats?.visitorsToday ?? 0}</p>
                </div>
                <div className="bg-[#14532D]/5 p-3 rounded-lg border border-[#14532D]/20 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-[#14532D] mb-1 font-semibold">Live Now</p>
                  <p className="font-serif text-xl font-bold text-[#14532D]">{stats?.liveVisitors ?? 0}</p>
                </div>
                <div className="bg-[#F8F7F3] p-3 rounded-lg border border-[#E5E5E0]">
                  <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">This Month</p>
                  <p className="font-serif text-xl font-bold text-[#14532D]">{stats?.visitorsThisMonth ?? 0}</p>
                </div>
                <div className="bg-[#F8F7F3] p-3 rounded-lg border border-[#E5E5E0]">
                  <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Returning</p>
                  <p className="font-serif text-xl font-bold text-[#14532D]">{stats?.returningVisitors ?? 0}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-1">
                <Link href="/admin/analytics/live" className="flex-1 bg-[#14532D] text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#166534] transition-colors">
                  <Activity className="w-3.5 h-3.5" /> View Live Visitors
                </Link>
                <Link href="/admin/analytics" className="flex-1 bg-white border border-[#E5E5E0] text-[#1C1C1C] text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#F8F7F3] transition-colors">
                  <BarChart3 className="w-3.5 h-3.5 text-[#C9A227]" /> Visitor Analytics
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#C9A227]" />
            <h3 className="font-serif text-base font-bold text-[#14532D]">Recent Activity</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-[#F8F7F3] rounded animate-pulse" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-[#555555]">No recent activity to display.</p>
          ) : (
            <ul className="space-y-2.5">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 border-b border-[#F8F7F3] last:border-0">
                  <span className="text-xs text-[#1C1C1C] font-medium truncate">{item.label}</span>
                  {item.time && (
                    <span className="text-[10px] text-[#555555] font-mono shrink-0">
                      {new Date(item.time).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Nav */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Magazine", href: "/admin/magazines", icon: <BookOpen className="w-4 h-4" /> },
          { label: "Add Story", href: "/admin/stories", icon: <FileText className="w-4 h-4" /> },
          { label: "Add VIP Profile", href: "/admin/vip", icon: <UserCheck className="w-4 h-4" /> },
          { label: "Add VVIP Profile", href: "/admin/vvip", icon: <Crown className="w-4 h-4" /> },
        ].map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className="flex items-center gap-2.5 bg-white border border-[#E5E5E0] rounded-xl px-4 py-3 text-sm font-medium text-[#14532D] hover:bg-[#14532D] hover:text-white hover:border-[#14532D] transition-all duration-200 group"
          >
            <span className="text-[#C9A227] group-hover:text-white transition-colors">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
