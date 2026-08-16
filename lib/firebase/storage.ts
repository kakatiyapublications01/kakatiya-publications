import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadMagazinePdf(file: File, folderName: string = "magazines"): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Invalid document type. Only PDF files are allowed.");
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("File size exceeds 50MB limit.");
  }

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storageRef = ref(storage, `${folderName}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: "application/pdf",
  });

  return await getDownloadURL(snapshot.ref);
}

export async function uploadPosterImage(file: File, folderName: string = "posters"): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid image format. Allowed formats: JPEG, PNG, WEBP.");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Image size exceeds 10MB limit.");
  }

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const storageRef = ref(storage, `${folderName}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return await getDownloadURL(snapshot.ref);
}

export async function deleteStorageFileByUrl(fileUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn("Storage file deletion warning:", error);
  }
}
