"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";

export interface AnnouncementActionResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export async function createAnnouncementAction(data: {
  title: string;
  content: string;
  imageUrl?: string;
  isActive?: boolean;
  authorName?: string;
}): Promise<AnnouncementActionResponse> {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "శీర్షిక (Title) అవసరం." };
    }
    if (!data.content?.trim()) {
      return { success: false, error: "వివరాలు (Content) అవసరం." };
    }

    const now = new Date().toISOString();
    const docData: Record<string, unknown> = {
      title: data.title.trim(),
      content: data.content.trim(),
      isActive: data.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    if (data.imageUrl && data.imageUrl.trim()) {
      docData.imageUrl = data.imageUrl.trim();
    }
    if (data.authorName && data.authorName.trim()) {
      docData.authorName = data.authorName.trim();
    }

    const docRef = await adminDb.collection("announcements").add(docData);

    revalidatePath("/");
    revalidatePath("/admin/announcements");

    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create announcement.";
    console.error("Error in createAnnouncementAction:", err);
    return { success: false, error: message };
  }
}

export async function updateAnnouncementAction(
  id: string,
  data: {
    title?: string;
    content?: string;
    imageUrl?: string | null;
    isActive?: boolean;
    authorName?: string;
  }
): Promise<AnnouncementActionResponse> {
  try {
    if (!id) {
      return { success: false, error: "Announcement ID is missing." };
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.content !== undefined) updatePayload.content = data.content.trim();
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.authorName !== undefined) updatePayload.authorName = data.authorName;

    await adminDb.collection("announcements").doc(id).update(updatePayload);

    revalidatePath("/");
    revalidatePath("/admin/announcements");

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update announcement.";
    console.error("Error in updateAnnouncementAction:", err);
    return { success: false, error: message };
  }
}

export async function toggleAnnouncementActiveAction(
  id: string,
  isActive: boolean
): Promise<AnnouncementActionResponse> {
  try {
    if (!id) return { success: false, error: "Announcement ID is missing." };

    await adminDb.collection("announcements").doc(id).update({
      isActive,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/");
    revalidatePath("/admin/announcements");

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to toggle status.";
    console.error("Error in toggleAnnouncementActiveAction:", err);
    return { success: false, error: message };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<AnnouncementActionResponse> {
  try {
    if (!id) return { success: false, error: "Announcement ID is missing." };

    await adminDb.collection("announcements").doc(id).delete();

    revalidatePath("/");
    revalidatePath("/admin/announcements");

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete announcement.";
    console.error("Error in deleteAnnouncementAction:", err);
    return { success: false, error: message };
  }
}
