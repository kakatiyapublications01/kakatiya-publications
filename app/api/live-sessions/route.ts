import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// Basic rate limiting map for live session heartbeats
const ipRateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // Max 60 heartbeats per minute per IP

// Helper to count active sessions within the last 60 seconds
async function getActiveSessionCount(): Promise<number> {
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
  try {
    const snapshot = await adminDb
      .collection("live_sessions")
      .where("lastSeenAt", ">=", sixtySecondsAgo)
      .get();
    return snapshot.size;
  } catch (error) {
    console.error("Error querying active live sessions:", error);
    return 0;
  }
}

// Background cleanup of stale sessions older than 5 minutes
async function cleanupStaleSessions() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  try {
    const staleDocs = await adminDb
      .collection("live_sessions")
      .where("lastSeenAt", "<", fiveMinutesAgo)
      .limit(50)
      .get();

    if (!staleDocs.empty) {
      const batch = adminDb.batch();
      staleDocs.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  } catch (error) {
    // Ignore non-critical background cleanup errors
    console.warn("Stale sessions cleanup error:", error);
  }
}

export async function GET() {
  try {
    const count = await getActiveSessionCount();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("GET live-sessions error:", error);
    return NextResponse.json({ success: false, count: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const now = Date.now();

    // Rate Limiting check
    const rateData = ipRateLimitMap.get(ip) || { count: 0, lastReset: now };
    if (now - rateData.lastReset > RATE_LIMIT_WINDOW_MS) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count += 1;
    }
    ipRateLimitMap.set(ip, rateData);

    if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Rate limit exceeded." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { sessionId, page, visitorId, device, browser } = body;

    if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
      return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
    }

    const cleanSessionId = sessionId.trim().substring(0, 64);
    const isoNow = new Date().toISOString();
    const docRef = adminDb.collection("live_sessions").doc(cleanSessionId);

    const docSnap = await docRef.get();
    if (docSnap.exists) {
      await docRef.update({
        lastSeenAt: isoNow,
        page: typeof page === "string" ? page.substring(0, 100) : "/",
        ...(visitorId && typeof visitorId === "string" ? { visitorId } : {}),
        ...(device && typeof device === "string" ? { device } : {}),
        ...(browser && typeof browser === "string" ? { browser } : {}),
      });
    } else {
      await docRef.set({
        sessionId: cleanSessionId,
        createdAt: isoNow,
        lastSeenAt: isoNow,
        page: typeof page === "string" ? page.substring(0, 100) : "/",
        visitorId: visitorId && typeof visitorId === "string" ? visitorId : null,
        device: device && typeof device === "string" ? device : "Unknown",
        browser: browser && typeof browser === "string" ? browser : "Unknown",
      });
    }

    // Trigger asynchronous non-blocking cleanup of stale documents
    cleanupStaleSessions().catch(() => {});

    // Return current active count
    const activeCount = await getActiveSessionCount();

    return NextResponse.json({
      success: true,
      count: activeCount,
    });
  } catch (error) {
    console.error("POST live-sessions heartbeat error:", error);
    return NextResponse.json(
      { error: "Internal server error", count: 0 },
      { status: 500 }
    );
  }
}
