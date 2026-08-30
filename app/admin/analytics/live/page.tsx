"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth as firebaseAuth } from "@/lib/firebase/config";
import { Activity, Globe, Monitor, Smartphone, Tablet, X, Clock, MapPin, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LiveAnalyticsPage() {
  return (
    <AdminGuard>
      <LiveAnalyticsContent />
    </AdminGuard>
  );
}

interface LiveSession {
  sessionId: string;
  page: string;
  lastSeenAt: string;
  createdAt: string;
  visitorId: string | null;
  device: string;
  browser: string;
  location?: string;
}

function LiveAnalyticsContent() {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function setupListener() {
      // Refresh token to ensure admin claim is present for visitor doc reads
      if (firebaseAuth.currentUser) {
        try { await firebaseAuth.currentUser.getIdToken(true); } catch (e) { /* ignore */ }
      }

      // We consider active as seen in the last 60 seconds (as per backend config)
      const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const q = query(
        collection(db, "live_sessions"),
        where("lastSeenAt", ">=", sixtySecondsAgo)
      );

      unsubscribe = onSnapshot(q, async (snapshot) => {
        const sessions: LiveSession[] = [];
        const pCounts: Record<string, number> = {};
        const visitorFetches: Promise<void>[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const session: LiveSession = {
            sessionId: data.sessionId,
            page: data.page || "/",
            lastSeenAt: data.lastSeenAt,
            createdAt: data.createdAt,
            visitorId: data.visitorId || null,
            device: data.device || "Unknown",
            browser: data.browser || "Unknown",
            location: "Location unavailable"
          };

          if (session.visitorId) {
            visitorFetches.push(
              getDoc(doc(db, "visitors", session.visitorId)).then(vDoc => {
                if (vDoc.exists()) {
                  const vData = vDoc.data();
                  if (vData.address) {
                    const parts = vData.address.split(",").map((p: string) => p.trim());
                    session.location = parts.slice(0, 3).join(", ");
                  }
                }
              }).catch(() => {})
            );
          }

          sessions.push(session);
          pCounts[session.page] = (pCounts[session.page] || 0) + 1;
        });

        await Promise.all(visitorFetches);
        sessions.sort((a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime());

        setLiveSessions(sessions);
        setPageCounts(pCounts);
      }, (err) => {
        console.error("Live sessions snapshot error:", err);
      });
    }

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getDeviceIcon = (device: string) => {
    if (device === "Mobile") return <Smartphone className="w-4 h-4 text-[#555555]" />;
    if (device === "Tablet") return <Tablet className="w-4 h-4 text-[#555555]" />;
    return <Monitor className="w-4 h-4 text-[#555555]" />;
  };

  const getRelativeTime = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <AdminLayout pageTitle="Live Visitors">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-white border border-[#E5E5E0] rounded-xl p-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Live Now</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#14532D]">
                {liveSessions.length} <span className="text-xl font-normal text-[#555555]">Active Sessions</span>
              </h2>
              <p className="text-xs text-[#555555] mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Updates automatically
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F7F3] border border-[#E5E5E0]">
              <Activity className="w-5 h-5 text-[#C9A227]" />
            </div>
          </div>

          {/* Current Page Analytics */}
          {Object.keys(pageCounts).length > 0 && (
            <div className="bg-white border border-[#E5E5E0] rounded-xl p-6">
              <h3 className="font-serif text-lg font-bold text-[#14532D] mb-4">What are visitors reading right now?</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(pageCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([page, count], i) => (
                    <div key={i} className="bg-[#F8F7F3] rounded-lg p-3 border border-[#E5E5E0]">
                      <p className="text-sm font-semibold text-[#1C1C1C] truncate" title={page}>
                        {page === "/" ? "Homepage" : page}
                      </p>
                      <p className="text-xs text-[#555555] mt-1">{count} live {count === 1 ? "visitor" : "visitors"}</p>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Activity Table */}
          <div className="bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E5E0] bg-[#F8F7F3] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#14532D]">Live Activity Feed</h3>
              <span className="text-[10px] text-[#555555] uppercase tracking-wider">Most recent first</span>
            </div>
            
            {liveSessions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <Search className="w-8 h-8 text-[#E5E5E0] mb-3" />
                <p className="font-medium text-[#1C1C1C]">No visitors are active right now.</p>
                <p className="text-sm text-[#555555] mt-1">Waiting for activity...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-[#E5E5E0]">
                    <tr className="text-[11px] uppercase tracking-wider text-[#14532D] font-semibold">
                      <th className="py-3 px-6">Visitor</th>
                      <th className="py-3 px-6">Location</th>
                      <th className="py-3 px-6">Current Page</th>
                      <th className="py-3 px-6">Device</th>
                      <th className="py-3 px-6">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F8F7F3]">
                    {liveSessions.map((session) => (
                      <tr 
                        key={session.sessionId} 
                        onClick={() => setSelectedSession(session)}
                        className={`cursor-pointer transition-colors ${selectedSession?.sessionId === session.sessionId ? "bg-[#14532D]/5" : "hover:bg-[#F8F7F3]"}`}
                      >
                        <td className="py-3 px-6 text-[#1C1C1C] font-mono text-xs">
                          {session.visitorId ? `ID #${session.visitorId.slice(-5).toUpperCase()}` : `Anon #${session.sessionId.slice(-5).toUpperCase()}`}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span className="text-[#555555] truncate max-w-[150px]">{session.location}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <span className="inline-block bg-[#F8F7F3] border border-[#E5E5E0] text-[#14532D] text-xs px-2 py-0.5 rounded truncate max-w-[150px]">
                            {session.page === "/" ? "Home" : session.page}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(session.device)}
                            <span className="text-[#555555]">{session.device} • {session.browser}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-[#1C1C1C] font-medium text-xs">
                          {getRelativeTime(session.lastSeenAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-6 py-3 border-t border-[#E5E5E0] bg-[#F8F7F3] text-right">
              <p className="text-[10px] text-[#555555]">Visitor locations are approximate and displayed for analytics purposes.</p>
            </div>
          </div>
        </div>

        {/* Details Drawer */}
        {selectedSession && (
          <div className="w-full lg:w-80 bg-white border border-[#E5E5E0] rounded-xl shrink-0 overflow-hidden shadow-sm self-start sticky top-24">
            <div className="p-4 border-b border-[#E5E5E0] bg-[#F8F7F3] flex items-center justify-between">
              <h3 className="font-serif font-bold text-[#14532D]">Session Details</h3>
              <button 
                onClick={() => setSelectedSession(null)}
                className="text-[#555555] hover:text-[#14532D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Visitor Identity</p>
                <p className="text-sm font-mono text-[#1C1C1C] font-medium">
                  {selectedSession.visitorId ? `Registered #${selectedSession.visitorId.slice(-6).toUpperCase()}` : `Anonymous #${selectedSession.sessionId.slice(-6).toUpperCase()}`}
                </p>
              </div>
              
              <div className="w-full h-px bg-[#E5E5E0]" />
              
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Approximate Location</p>
                <p className="text-sm text-[#1C1C1C] font-medium">{selectedSession.location}</p>
              </div>

              <div className="w-full h-px bg-[#E5E5E0]" />
              
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Current Page</p>
                <p className="text-sm text-[#14532D] font-medium break-all">{selectedSession.page}</p>
              </div>

              <div className="w-full h-px bg-[#E5E5E0]" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Device</p>
                  <div className="flex items-center gap-1.5 text-sm text-[#1C1C1C] font-medium">
                    {getDeviceIcon(selectedSession.device)} {selectedSession.device}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Browser</p>
                  <p className="text-sm text-[#1C1C1C] font-medium">{selectedSession.browser}</p>
                </div>
              </div>

              <div className="w-full h-px bg-[#E5E5E0]" />
              
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#555555] mb-1">Session Timing</p>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#555555]">Started</span>
                    <span className="text-[#1C1C1C] font-medium">
                      {new Date(selectedSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#555555]">Last Active</span>
                    <span className="text-[#1C1C1C] font-medium">{getRelativeTime(selectedSession.lastSeenAt)}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-2 pt-2 border-t border-[#F8F7F3]">
                    <span className="text-[#555555]">Status</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
