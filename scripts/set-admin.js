const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

const targetEmail = process.argv[2];

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

if (!clientEmail || !privateKey) {
  console.error("Error: FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY is missing in .env.local");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function run() {
  const auth = getAuth();
  if (!targetEmail) {
    console.log("No email specified. Listing existing Firebase Auth users:");
    const userList = await auth.listUsers(10);
    if (userList.users.length === 0) {
      console.log("No users found in Firebase Authentication.");
    } else {
      userList.users.forEach((u) => {
        console.log(`- Email: ${u.email} | UID: ${u.uid} | Admin Claim: ${Boolean(u.customClaims?.admin)}`);
      });
    }
    console.log("\nTo grant admin claim run: node scripts/set-admin.js <user-email>");
    return;
  }

  try {
    const user = await auth.getUserByEmail(targetEmail);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`\n✅ SUCCESSFULLY SET ADMIN CLAIM (admin: true) for user: ${targetEmail} (${user.uid})\n`);
  } catch (error) {
    console.error("Error setting admin claim:", error.message);
  }
}

run();
