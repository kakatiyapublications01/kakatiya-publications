import fs from "fs";
import { GoogleAuth } from "google-auth-library";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!clientEmail || !privateKey || !projectId) {
  console.error("Missing Firebase service account credentials.");
  process.exit(1);
}

const auth = new GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: [
    "https://www.googleapis.com/auth/firebase",
    "https://www.googleapis.com/auth/cloud-platform",
  ],
});

async function deployRules(filename, releaseName) {
  const content = fs.readFileSync(filename, "utf-8");
  const client = await auth.getClient();

  console.log(`Creating ruleset for ${filename}...`);
  const createRes = await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    method: "POST",
    data: {
      source: {
        files: [
          {
            name: filename,
            content: content,
          },
        ],
      },
    },
  });

  const rulesetName = createRes.data.name;
  console.log(`Ruleset created: ${rulesetName}`);

  console.log(`Updating release: ${releaseName}...`);
  try {
    await client.request({
      url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/${releaseName}`,
      method: "PATCH",
      data: {
        release: {
          name: `projects/${projectId}/releases/${releaseName}`,
          rulesetName: rulesetName,
        },
      },
    });
    console.log(`✅ Release ${releaseName} updated successfully!`);
  } catch (err) {
    if (err.status === 404) {
      console.log(`Release not found, creating new release: ${releaseName}...`);
      await client.request({
        url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
        method: "POST",
        data: {
          name: `projects/${projectId}/releases/${releaseName}`,
          rulesetName: rulesetName,
        },
      });
      console.log(`✅ Release ${releaseName} created successfully!`);
    } else {
      throw err;
    }
  }
}

async function main() {
  console.log(`Deploying rules for project: ${projectId}`);

  // Deploy Firestore rules
  await deployRules("firestore.rules", "cloud.firestore");

  // Deploy Storage rules
  if (storageBucket) {
    await deployRules("storage.rules", `firebase.storage/${storageBucket}`);
  }

  console.log("All rules deployed successfully!");
}

main().catch((err) => {
  console.error("Deploy failed:", err?.response?.data || err.message);
  process.exit(1);
});
