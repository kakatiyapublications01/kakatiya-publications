import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";
import { ensureAdminAuth } from "./auth";
import { Announcement } from "@/types";

const COLLECTION_NAME = "announcements";

function sanitizeData<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Announcement[];

    return docs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error("Error fetching published announcements:", err);
    return [];
  }
}

export async function getAllAnnouncementsAdmin(): Promise<Announcement[]> {
  await ensureAdminAuth();
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Announcement[];
  } catch (err) {
    console.warn("Falling back to unindexed query for admin announcements:", err);
    const fallbackQ = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(fallbackQ);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Announcement[];

    return docs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }
}

export async function createAnnouncement(
  data: Omit<Announcement, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  await ensureAdminAuth();
  const cleanData = sanitizeData(data as unknown as Record<string, unknown>);
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...cleanData,
    isActive: cleanData.isActive !== false,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateAnnouncement(
  id: string,
  data: Partial<Omit<Announcement, "id" | "createdAt">>
): Promise<void> {
  await ensureAdminAuth();
  const cleanData = sanitizeData(data as unknown as Record<string, unknown>);
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
}

export async function toggleAnnouncementActive(id: string, isActive: boolean): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    isActive,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
