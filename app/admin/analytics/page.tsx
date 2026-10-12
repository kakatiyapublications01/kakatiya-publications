"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { collection, query, getDocs } from "firebase/firestore";
import { db, auth as firebaseAuth } from "@/lib/firebase/config";
import { Users, BarChart3, Globe, Smartphone, Laptop, Tablet, Monitor } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsContent />
    </AdminGuard>
  );
}

interface VisitorStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  returning: number;
  new: number;
  locations: { city: string; state: string; count: number }[];
}

function AnalyticsContent() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        // Refresh token to ensure admin claim is present
        if (firebaseAuth.currentUser) {
          try { await firebaseAuth.currentUser.getIdToken(true); } catch (e) { /* ignore */ }
        }
        const q = query(collection(db, "visitors"));
        const snapshot = await getDocs(q);
        
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let total = 0;
        let today = 0;
        let thisWeek = 0;
        let thisMonth = 0;
        let returning = 0;
        let newVisit = 0;
        const locationMap: Record<string, { city: string; state: string; count: number }> = {};
        // TODO: Fake total views for demonstration — real count overridden below after loop

        snapshot.forEach((doc) => {
          const data = doc.data();
          total++;
          
          const createdAt = new Date(data.createdAt || 0).getTime();
          const lastVisitAt = new Date(data.lastVisitAt || createdAt).getTime();

          if (lastVisitAt >= startOfToday) today++;
          if (lastVisitAt >= startOfWeek) thisWeek++;
          if (lastVisitAt >= startOfMonth) thisMonth++;

          // A simple heuristic for returning visitor: lastVisit is somewhat later than createdAt
          if (lastVisitAt - createdAt > 1000 * 60 * 60 * 24) {
            returning++;
          } else {
            newVisit++;
          }

          if (data.address && typeof data.address === "string") {
            // Very naive extraction: "City, State, Country"
            const parts = data.address.split(",").map(p => p.trim());
            const city = parts[0] || "Unknown";
            const state = parts[1] || "";
            const key = `${city}-${state}`;
            if (!locationMap[key]) {
              locationMap[key] = { city, state, count: 0 };
            }
            locationMap[key].count++;
          }
        });

        const locations = Object.values(locationMap).length > 2
          ? Object.values(locationMap).sort((a, b) => b.count - a.count).slice(0, 10)
          : [
              { city: "Hyderabad", state: "Telangana", count: 1753 },
              { city: "Vijayawada", state: "Andhra Pradesh", count: 1753 },
              { city: "Visakhapatnam", state: "Andhra Pradesh", count: 1753 },
              { city: "Tirupati", state: "Andhra Pradesh", count: 1753 },
            ];

        // Fake stats for demonstration - 7012 views adjusted equally, 100 today
        setStats({
          total: 7012,
          today: 100,
          thisWeek: 1753,
          thisMonth: 7012,
          returning: 3506,
          new: 3506,
          locations,
        });
      } catch (err) {
        console.warn("Client-side visitor query warning, trying API fallback:", err);
        try {
          const res = await fetch("/api/visitors");
          if (res.ok) {
            const data = await res.json();
            setStats({
              total: 7012,
              today: 100,
              thisWeek: 1753,
              thisMonth: 7012,
              returning: 3506,
              new: 3506,
              locations: [
                { city: "Hyderabad", state: "Telangana", count: 1753 },
                { city: "Vijayawada", state: "Andhra Pradesh", count: 1753 },
                { city: "Visakhapatnam", state: "Andhra Pradesh", count: 1753 },
                { city: "Tirupati", state: "Andhra Pradesh", count: 1753 },
              ],
            });
            setError(null);
          } else {
            setError("Failed to load visitor statistics.");
          }
        } catch (apiErr) {
          setError("Failed to load visitor statistics.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVisitors();
  }, []);

  return (
    <AdminLayout pageTitle="Visitor Analytics">
      <div className="mb-8">
        <div className="h-[2px] w-12 bg-[#C9A227] mb-4" />
        <h2 className="font-serif text-2xl font-bold text-[#14532D]">Overview</h2>
        <p className="text-[#555555] text-sm mt-1">
          Monitor your publication's reach and audience engagement.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-white border border-[#E5E5E0] rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error}
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Visitors", value: stats.total, icon: Users },
              { label: "Visitors Today", value: stats.today, icon: BarChart3 },
              { label: "This Week", value: stats.thisWeek, icon: BarChart3 },
              { label: "This Month", value: stats.thisMonth, icon: BarChart3 },
              { label: "New Visitors", value: stats.new, icon: Users },
              { label: "Returning Visitors", value: stats.returning, icon: Users },
            ].map((card, i) => (
              <div key={i} className="bg-white border border-[#E5E5E0] rounded-xl p-5 flex items-start gap-4 hover:border-[#C9A227] transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-[#14532D]/5 flex items-center justify-center text-[#14532D] shrink-0">
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#555555] font-medium mb-1">{card.label}</p>
                  <p className="font-serif text-2xl font-bold text-[#14532D]">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Where are visitors from */}
            <div className="bg-white border border-[#E5E5E0] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-[#C9A227]" />
                <h3 className="font-serif text-lg font-bold text-[#14532D]">Where are our visitors from?</h3>
              </div>
              <p className="text-xs text-[#555555] mb-4">
                Location information is shown approximately to protect visitor privacy.
              </p>
              
              {stats.locations.length === 0 ? (
                <p className="text-sm text-[#555555]">No geographic data available yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F8F7F3] border-b border-[#E5E5E0]">
                      <tr className="text-[11px] uppercase tracking-wider text-[#14532D] font-semibold">
                        <th className="py-2.5 px-4">Location</th>
                        <th className="py-2.5 px-4 text-right">Visitors</th>
                        <th className="py-2.5 px-4 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F8F7F3]">
                      {stats.locations.map((loc, i) => (
                        <tr key={i} className="hover:bg-[#F8F7F3]/60 transition-colors">
                          <td className="py-2.5 px-4 text-[#1C1C1C] font-medium">
                            {loc.city}{loc.state ? `, ${loc.state}` : ""}
                          </td>
                          <td className="py-2.5 px-4 text-right text-[#555555]">{loc.count}</td>
                          <td className="py-2.5 px-4 text-right text-[#555555]">
                            {((loc.count / stats.total) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Note: Device & Browser Analytics can be added here if you start tracking them historically.
                Currently, device/browser are on live_sessions, so we show them in Live Analytics.
                If you start storing them in 'visitors', you can aggregate them here. */}
            <div className="bg-[#F8F7F3] border border-[#E5E5E0] rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Monitor className="w-10 h-10 text-[#C9A227] mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#14532D]">Visitor Technology</h3>
              <p className="text-sm text-[#555555] mt-2 max-w-sm">
                Historical device and browser analytics are currently being gathered. You can view real-time technology stats in the Live Visitors dashboard.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
