"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Story, PublishStatus } from "@/types";
import {
  getAllStoriesAdmin,
  createStory,
  updateStory,
  updateStoryStatus,
  deleteStory,
} from "@/lib/firebase/stories";
import { uploadPosterImage } from "@/lib/firebase/storage";
import {
  createStoryAction,
  updateStoryAction,
  updateStoryStatusAction,
  deleteStoryAction,
} from "@/app/actions/stories";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  User,
  Tag,
  BookOpen,
} from "lucide-react";

const CATEGORIES: Story["category"][] = [
  "Editorial",
  "Message",
  "Cultural",
  "Feature",
  "Event",
];

export default function AdminStoriesPage() {
  return (
    <AdminGuard>
      <AdminStoriesContent />
    </AdminGuard>
  );
}

function AdminStoriesContent() {
  const { user, isAdmin } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add form fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<Story["category"]>("Editorial");
  const [formAuthor, setFormAuthor] = useState("KakatiyaPulse Editorial Board");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<PublishStatus>("published");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form fields
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Story["category"]>("Editorial");
  const [editAuthor, setEditAuthor] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editStatus, setEditStatus] = useState<PublishStatus>("published");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const loadStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllStoriesAdmin();
      setStories(data);
    } catch (err: unknown) {
      console.warn("Direct fetch warning, retrying:", err);
      try {
        const data = await getAllStoriesAdmin();
        setStories(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load stories.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadStories();
    }
  }, [user, isAdmin]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openAddModal = () => {
    setFormTitle("");
    setFormCategory("Editorial");
    setFormAuthor("KakatiyaPulse Editorial Board");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormExcerpt("");
    setFormContent("");
    setFormStatus("published");
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    setImageInputMode("upload");
    setFormError(null);
    setShowAddModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Please select a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image size must be less than 10MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditImageFile(file);
      setEditImagePreview(previewUrl);
    } else {
      setImageFile(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formContent.trim()) {
      setFormError("Story content text is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let finalPosterUrl = imageUrl.trim();

      if (imageFile) {
        try {
          finalPosterUrl = await uploadPosterImage(imageFile, "posters");
        } catch (uploadErr) {
          console.warn("Image upload failed:", uploadErr);
          throw new Error("Failed to upload poster image. Please try again.");
        }
      }

      const res = await createStoryAction({
        title: formTitle.trim(),
        content: formContent.trim(),
        excerpt: formExcerpt.trim() || formContent.trim().slice(0, 160) + "...",
        category: formCategory,
        date: formDate,
        author: formAuthor.trim(),
        status: formStatus,
        posterUrl: finalPosterUrl,
      });

      if (res.success) {
        showSuccess("Story published successfully!");
        setShowAddModal(false);
        await loadStories();
      } else {
        // Fallback to client-side Firestore
        await createStory({
          title: formTitle.trim(),
          slug: formTitle.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") + `-${Date.now().toString(36)}`,
          content: formContent.trim(),
          excerpt: formExcerpt.trim() || formContent.trim().slice(0, 160) + "...",
          category: formCategory,
          date: formDate,
          author: formAuthor.trim(),
          status: formStatus,
          posterUrl: finalPosterUrl,
        });
        showSuccess("Story published successfully!");
        setShowAddModal(false);
        await loadStories();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating story.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: Story) => {
    setEditingStory(item);
    setEditTitle(item.title);
    setEditCategory(item.category || "Editorial");
    setEditAuthor(item.author || "KakatiyaPulse Editorial Board");
    setEditDate(item.date || new Date().toISOString().split("T")[0]);
    setEditExcerpt(item.excerpt || "");
    setEditContent(item.content || "");
    setEditStatus(item.status || "published");
    setEditImageUrl(item.posterUrl || "");
    setEditImageFile(null);
    setEditImagePreview(item.posterUrl || null);
    setFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;

    if (!editTitle.trim() || !editContent.trim()) {
      setFormError("Title and Content are required.");
      return;
    }

    try {
      setIsEditing(true);
      setFormError(null);

      let finalPosterUrl = editImageUrl;

      if (editImageFile) {
        finalPosterUrl = await uploadPosterImage(editImageFile, "posters");
      }

      const res = await updateStoryAction(editingStory.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        excerpt: editExcerpt.trim() || editContent.trim().slice(0, 160) + "...",
        category: editCategory,
        date: editDate,
        author: editAuthor.trim(),
        status: editStatus,
        posterUrl: finalPosterUrl,
      });

      if (res.success) {
        showSuccess("Story updated successfully!");
      } else {
        await updateStory(editingStory.id, {
          title: editTitle.trim(),
          content: editContent.trim(),
          excerpt: editExcerpt.trim() || editContent.trim().slice(0, 160) + "...",
          category: editCategory,
          date: editDate,
          author: editAuthor.trim(),
          status: editStatus,
          posterUrl: finalPosterUrl,
        });
        showSuccess("Story updated successfully!");
      }

      setEditingStory(null);
      await loadStories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating story.";
      setFormError(msg);
    } finally {
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (item: Story, newStatus: PublishStatus) => {
    try {
      setStories((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: newStatus } : s))
      );
      const res = await updateStoryStatusAction(item.id, newStatus);
      if (!res.success) {
        await updateStoryStatus(item.id, newStatus);
      }
      showSuccess(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error("Status change error:", err);
      loadStories();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await deleteStoryAction(id);
      if (!res.success) {
        await deleteStory(id);
      }
      setStories((prev) => prev.filter((s) => s.id !== id));
      showSuccess("Story deleted successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting story.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout pageTitle="Stories & Articles">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E0] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#14532D]" />
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#14532D]">
                Stories &amp; Articles Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Publish editorial columns, leadership messages, cultural chronicles, and community articles.
            </p>
          </div>

          <Button
            onClick={openAddModal}
            variant="green"
            size="md"
            className="flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Story</span>
          </Button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 text-sm animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stories Listing */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] flex flex-col items-center justify-center gap-3 text-[#555555]">
            <Loader2 className="w-8 h-8 animate-spin text-[#14532D]" />
            <p className="text-sm font-medium">Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] text-center space-y-4">
            <div className="w-16 h-16 bg-[#14532D]/10 text-[#14532D] rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-[#14532D]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14532D]">No Stories Published Yet</h3>
              <p className="text-xs text-[#555555] mt-1 max-w-md mx-auto">
                Get started by creating your first editorial article or story using the button below.
              </p>
            </div>
            <Button onClick={openAddModal} variant="green" size="sm" className="gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Write New Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E5E5E0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col">
                  {/* Status & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#14532D] bg-[#14532D]/10 px-2 py-0.5 rounded">
                      {item.category || "Editorial"}
                    </span>

                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value as PublishStatus)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded border cursor-pointer ${
                        item.status === "published"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : item.status === "draft"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Thumbnail */}
                  {item.posterUrl ? (
                    <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-100 aspect-video bg-gray-100">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video mb-3 rounded-lg border border-dashed border-gray-200 bg-[#FDFCF7] flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-serif text-lg font-bold text-[#14532D] line-clamp-2 mb-1.5">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed flex-1">
                    {item.excerpt || item.content}
                  </p>

                  {/* Metadata */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#777777]">
                    <span className="truncate max-w-[160px]">
                      By {item.author || "Editorial Board"}
                    </span>
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="bg-[#FAF9F5] px-4 py-2.5 border-t border-[#E5E5E0] flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewStory(item)}
                      className="p-1.5 text-gray-600 hover:text-[#14532D] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-600 hover:text-[#C9A227] hover:bg-white rounded transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                        handleDelete(item.id);
                      }
                    }}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Delete"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E5E5E0] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#14532D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C9A227]" />
                <h2 className="font-serif text-lg font-bold">Write &amp; Publish New Story</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  Story Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Kakatiya Legacy: A Heritage of Cultural & Architectural Wonder"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C]"
                />
              </div>

              {/* Category, Author, Date, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Story["category"])}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Author</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PublishStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  Excerpt / Short Summary
                </label>
                <textarea
                  rows={2}
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  placeholder="A brief overview or teaser for the card and broadsheet header..."
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  Full Story Text / Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter the full article or story text here (supports multiple paragraphs and Telugu / English text)..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C] leading-relaxed font-sans"
                />
                <span className="text-[11px] text-[#777777] font-mono">
                  {formContent.split(/\s+/).filter(Boolean).length} words &bull; {formContent.length} characters
                </span>
              </div>

              {/* Image / Poster */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                    Cover / Poster Image (Optional)
                  </label>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`px-2.5 py-1 rounded font-medium ${
                        imageInputMode === "upload"
                          ? "bg-[#14532D] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2.5 py-1 rounded font-medium ${
                        imageInputMode === "url"
                          ? "bg-[#14532D] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {imageInputMode === "upload" ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileChange(e, false)}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E5E5E0] hover:border-[#14532D] rounded-xl p-4 text-center cursor-pointer bg-[#FDFCF7] transition-colors"
                    >
                      {imagePreview ? (
                        <div className="relative aspect-video max-h-48 mx-auto rounded overflow-hidden">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full hover:bg-black"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-xs text-[#555555]">
                          <Upload className="w-6 h-6 text-[#14532D]" />
                          <span className="font-semibold text-[#14532D]">Click to select poster image</span>
                          <span>JPEG, PNG, WebP (Max 10MB)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://example.com/poster.jpg"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C]"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="green-outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  size="md"
                  disabled={isSubmitting}
                  className="gap-2 shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Publish Story</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E5E5E0] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#14532D] text-white flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold">Edit Story</h2>
              <button
                onClick={() => setEditingStory(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Story Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Story["category"])}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Author</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PublishStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Excerpt</label>
                <textarea
                  rows={2}
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Content</label>
                <textarea
                  required
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C] leading-relaxed font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Cover / Poster Image URL</label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => {
                    setEditImageUrl(e.target.value);
                    setEditImagePreview(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="green-outline"
                  size="md"
                  onClick={() => setEditingStory(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  size="md"
                  disabled={isEditing}
                  className="gap-2"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewStory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E5E0] p-6 space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
              <span className="text-xs font-bold uppercase tracking-widest text-[#14532D]">
                Article Preview &bull; {previewStory.category}
              </span>
              <button
                onClick={() => setPreviewStory(null)}
                className="text-gray-500 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {previewStory.posterUrl && (
              <img
                src={previewStory.posterUrl}
                alt={previewStory.title}
                className="w-full aspect-video object-cover rounded-lg border border-gray-100"
              />
            )}
            <h2 className="font-serif text-2xl font-bold text-[#14532D]">
              {previewStory.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#777777] border-b border-gray-100 pb-3">
              <span>By {previewStory.author}</span>
              <span>&bull;</span>
              <span>{previewStory.date}</span>
            </div>
            <div className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line font-sans">
              {previewStory.content}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
