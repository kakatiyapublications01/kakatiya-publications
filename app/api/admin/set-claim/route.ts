import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

// Whitelisted admin emails — these users can have the admin claim set
const ADMIN_EMAILS = [
  "sanjay@kakatiyapublications.com",
  "admin@kakatiyapulse.com",
];

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: "Unauthorized email address." },
        { status: 403 }
      );
    }

    // Look up the user by email
    const user = await adminAuth.getUserByEmail(email);

    // Set the admin custom claim
    await adminAuth.setCustomUserClaims(user.uid, { admin: true });

    return NextResponse.json({
      success: true,
      message: `Admin claim set for ${email}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error setting admin claim:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
