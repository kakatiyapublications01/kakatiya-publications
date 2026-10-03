"use server";

import { revalidatePath } from "next/cache";
import { adminDb } from "@/lib/firebase/admin";
import { PublishStatus, Story } from "@/types";

export interface StoryActionResponse {
  success: boolean;
  id?: string;
  error?: string;
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base || "story"}-${Date.now().toString(36)}`;
}

export async function createStoryAction(data: {
  title: string;
  slug?: string;
  posterUrl?: string;
  content: string;
  excerpt: string;
  category: Story["category"];
  date: string;
  author?: string;
  status: PublishStatus;
}): Promise<StoryActionResponse> {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Story title is required." };
    }
    if (!data.content?.trim()) {
      return { success: false, error: "Story content is required." };
    }

    const now = new Date().toISOString();
    const slug = data.slug?.trim() || generateSlug(data.title);

    const docData: Record<string, unknown> = {
      title: data.title.trim(),
      slug,
      posterUrl: data.posterUrl?.trim() || "",
      content: data.content.trim(),
      excerpt: data.excerpt?.trim() || data.content.trim().slice(0, 150) + "...",
      category: data.category || "Editorial",
      date: data.date || now.split("T")[0],
      author: data.author?.trim() || "KakatiyaPulse Editorial Board",
      status: data.status || "published",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection("stories").add(docData);

    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath("/admin/stories");

    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create story.";
    console.error("Error in createStoryAction:", err);
    return { success: false, error: message };
  }
}

export async function updateStoryAction(
  id: string,
  data: Partial<Omit<Story, "id" | "createdAt">>
): Promise<StoryActionResponse> {
  try {
    if (!id) return { success: false, error: "Story ID is missing." };

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
    if (data.posterUrl !== undefined) updatePayload.posterUrl = data.posterUrl.trim();
    if (data.content !== undefined) updatePayload.content = data.content.trim();
    if (data.excerpt !== undefined) updatePayload.excerpt = data.excerpt.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.author !== undefined) updatePayload.author = data.author.trim();
    if (data.status !== undefined) updatePayload.status = data.status;

    await adminDb.collection("stories").doc(id).update(updatePayload);

    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath("/admin/stories");

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update story.";
    console.error("Error in updateStoryAction:", err);
    return { success: false, error: message };
  }
}

export async function updateStoryStatusAction(
  id: string,
  status: PublishStatus
): Promise<StoryActionResponse> {
  try {
    if (!id) return { success: false, error: "Story ID is missing." };

    await adminDb.collection("stories").doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath("/admin/stories");

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update story status.";
    console.error("Error in updateStoryStatusAction:", err);
    return { success: false, error: message };
  }
}

export async function deleteStoryAction(id: string): Promise<StoryActionResponse> {
  try {
    if (!id) return { success: false, error: "Story ID is missing." };

    await adminDb.collection("stories").doc(id).delete();

    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath("/admin/stories");

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete story.";
    console.error("Error in deleteStoryAction:", err);
    return { success: false, error: message };
  }
}
