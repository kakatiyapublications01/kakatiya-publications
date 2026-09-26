import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdTokenResult,
} from "firebase/auth";
import { auth } from "./config";

export async function loginAdmin(email: string, pass: string): Promise<{ user: User; isAdmin: boolean }> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const tokenResult = await getIdTokenResult(credential.user, true);
  const isAdmin = Boolean(tokenResult.claims?.admin);

  return {
    user: credential.user,
    isAdmin,
  };
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function verifyUserAdminClaim(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const tokenResult = await getIdTokenResult(user, true);
    return Boolean(tokenResult.claims?.admin);
  } catch (error) {
    console.error("Error verifying admin claim:", error);
    return false;
  }
}

// Admin email whitelist — these are treated as admin regardless of Firebase claims
const ADMIN_EMAILS = [
  "sanjay@kakatiyapublications.com",
  "admin@kakatiyapulse.com",
];

export function subscribeAuthState(callback: (user: User | null, isAdmin: boolean) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const claimAdmin = await verifyUserAdminClaim(user);
      const whitelisted = ADMIN_EMAILS.includes(user.email ?? "");
      callback(user, claimAdmin || whitelisted);
    } else {
      callback(null, false);
    }
  });
}
