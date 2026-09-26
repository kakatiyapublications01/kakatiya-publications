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
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./config";
import { ensureAdminAuth } from "./auth";
import { Magazine, PublishStatus } from "@/types";

const COLLECTION_NAME = "magazines";

export async function getPublishedMagazines(): Promise<Magazine[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const serverCreatedAt = data.serverCreatedAt?.toDate
        ? data.serverCreatedAt.toDate().toISOString()
        : data.serverCreatedAt?.seconds
        ? new Date(data.serverCreatedAt.seconds * 1000).toISOString()
        : undefined;
      return {
        id: docSnap.id,
        ...data,
        ...(serverCreatedAt ? { serverCreatedAt } : {}),
      };
    }) as Magazine[];
    return docs.sort((a, b) => {
      if ((b.year || 0) !== (a.year || 0)) return (b.year || 0) - (a.year || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  } catch (err) {
    console.error("Error fetching published magazines:", err);
    return [];
  }
}

export async function getAllMagazinesAdmin(): Promise<Magazine[]> {
  await ensureAdminAuth();
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Magazine[];
  } catch (err) {
    console.warn("Falling back to unindexed query for admin magazines:", err);
    const fallbackQ = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(fallbackQ);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Magazine[];
    return docs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }
}

export async function getMagazineById(id: string): Promise<Magazine | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Magazine;
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

export async function createMagazine(
  data: Omit<Magazine, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  await ensureAdminAuth();
  const cleanData = sanitizeData(data as unknown as Record<string, unknown>);
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...cleanData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMagazineStatus(id: string, status: PublishStatus): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateMagazine(
  id: string,
  data: Partial<Omit<Magazine, "id" | "createdAt">>
): Promise<void> {
  await ensureAdminAuth();
  const cleanData = sanitizeData(data as unknown as Record<string, unknown>);
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteMagazine(id: string): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

