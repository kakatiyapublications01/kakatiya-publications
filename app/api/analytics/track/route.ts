import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting map for basic protection
const ipRateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

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
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { eventName, entityId, entityType, metadata } = body;

    if (!eventName || typeof eventName !== "string") {
      return NextResponse.json({ error: "Invalid eventName" }, { status: 400 });
    }

    // Server-controlled analytics event processing
    // Logs analytics metric cleanly on server side
    console.log(`[ANALYTICS EVENT] ${eventName}:`, {
      entityId,
      entityType,
      ip,
      timestamp: new Date().toISOString(),
      metadata,
    });

    return NextResponse.json({ success: true, trackedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Analytics tracking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
