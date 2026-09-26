import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./config";
import { ensureAdminAuth } from "./auth";
import { VipMember, PublishStatus } from "@/types";

const COLLECTION_NAME = "vip";

export async function getPublishedVipMembers(): Promise<VipMember[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VipMember[];
    return docs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (err) {
    console.error("Error fetching published VIP members:", err);
    return [];
  }
}

export async function getAllVipMembersAdmin(): Promise<VipMember[]> {
  await ensureAdminAuth();
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VipMember[];
  } catch (err) {
    console.warn("Falling back to unindexed query for admin VIP:", err);
    const fallbackQ = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(fallbackQ);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VipMember[];
    return docs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }
}

function sanitizeData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function createVipMember(
  data: Omit<VipMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  await ensureAdminAuth();
  const cleanData = sanitizeData(data as unknown as Record<string, unknown>);
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...cleanData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateVipMember(
  id: string,
  data: Partial<Omit<VipMember, "id" | "createdAt">>
): Promise<void> {
  await ensureAdminAuth();
  const cleanData = sanitizeData(data as unknown as Record<string, unknown>);
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateVipMemberStatus(id: string, status: PublishStatus): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteVipMember(id: string): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
