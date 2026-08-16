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
import { db } from "./config";
import { VvipMember } from "@/types";

const COLLECTION_NAME = "vvip";

export async function getPublishedVvipMembers(): Promise<VvipMember[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "published"),
    orderBy("displayOrder", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as VvipMember[];
}

export async function createVvipMember(
  data: Omit<VvipMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function deleteVvipMember(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
