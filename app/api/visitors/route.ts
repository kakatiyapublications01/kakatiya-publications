import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// Simple in-memory rate limiting map for basic protection
const ipRateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

export async function GET() {
  try {
    // TODO: Fake stats for demonstration
    return NextResponse.json({
      success: true,
      total: 3041,
      today: 523,
      thisWeek: 2518,
      thisMonth: 3041,
      returning: 252,
    });
  } catch (error) {
    console.error("GET /api/visitors error:", error);
    return NextResponse.json(
      { success: false, total: 0, today: 0, thisWeek: 0, thisMonth: 0, returning: 0 },
      { status: 500 }
    );
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
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { action } = body;

    // Action: ping returning visitor
    if (action === "ping") {
      const { visitorId } = body;
      if (!visitorId || typeof visitorId !== "string") {
        return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
      }

      try {
        const docRef = adminDb.collection("visitors").doc(visitorId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          await docRef.update({
            lastVisitAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Failed to update visitor lastVisitAt:", err);
      }

      return NextResponse.json({ success: true, updated: true });
    }

    // Action: create new visitor
    if (action === "create" || !action) {
      const {
        title,
        fullName,
        email,
        address,
        latitude,
        longitude,
        locationAccuracy,
        locationPermission,
        timezone,
      } = body;

      if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        return NextResponse.json({ error: "Full name is required." }, { status: 400 });
      }

      const isoNow = new Date().toISOString();
      const visitorRef = adminDb.collection("visitors").doc();

      const visitorData = {
        visitorId: visitorRef.id,
        title: title || "Mr.",
        fullName: fullName.trim(),
        email: email ? String(email).trim() : "",
        address: address ? String(address).trim() : "",
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
        locationAccuracy: typeof locationAccuracy === "number" ? locationAccuracy : null,
        locationPermission: locationPermission || "skipped",
        timezone: timezone || "UTC",
        createdAt: isoNow,
        lastVisitAt: isoNow,
      };

      await visitorRef.set(visitorData);

      return NextResponse.json({
        success: true,
        visitorId: visitorRef.id,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Visitors API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
