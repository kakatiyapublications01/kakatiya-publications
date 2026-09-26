// Script to set Firebase admin custom claim on a user
// Run with: node --env-file=.env.local scripts/set-admin-claim.mjs

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

if (!clientEmail || !privateKey || !projectId) {
  console.error("Missing Firebase Admin SDK credentials in env vars.");
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const auth = getAuth(app);
const email = "sanjay@kakatiyapublications.com";

try {
  const user = await auth.getUserByEmail(email);
  console.log(`Found user: ${user.uid} (${user.email})`);

  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log(`✅ Admin claim set successfully for ${email}`);

  // Verify
  const updated = await auth.getUser(user.uid);
  console.log("Custom claims:", updated.customClaims);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
