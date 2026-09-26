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
import { VvipMember, PublishStatus } from "@/types";

const COLLECTION_NAME = "vvip";

export async function getPublishedVvipMembers(): Promise<VvipMember[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VvipMember[];
    return docs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (err) {
    console.error("Error fetching published VVIP members:", err);
    return [];
  }
}

export async function getAllVvipMembersAdmin(): Promise<VvipMember[]> {
  await ensureAdminAuth();
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VvipMember[];
  } catch (err) {
    console.warn("Falling back to unindexed query for admin VVIP:", err);
    const fallbackQ = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(fallbackQ);
    const docs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as VvipMember[];
    return docs.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }
}

export async function createVvipMember(
  data: Omit<VvipMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  await ensureAdminAuth();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateVvipMember(
  id: string,
  data: Partial<Omit<VvipMember, "id" | "createdAt">>
): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateVvipMemberStatus(id: string, status: PublishStatus): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteVvipMember(id: string): Promise<void> {
  await ensureAdminAuth();
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
