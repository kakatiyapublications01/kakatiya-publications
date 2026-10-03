"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Announcement } from "@/types";
import {
  getAllAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncementActive,
  deleteAnnouncement,
} from "@/lib/firebase/announcements";
import { uploadPosterImage } from "@/lib/firebase/storage";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementActiveAction,
} from "@/app/actions/announcements";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Link as LinkIcon,
  X,
  Image as ImageIcon,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function AdminAnnouncementsPage() {
  return (
    <AdminGuard>
      <AdminAnnouncementsContent />
    </AdminGuard>
  );
}

function AdminAnnouncementsContent() {
  const { user, isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formAuthor, setFormAuthor] = useState("కాకతీయ పల్స్ ఎడిటోరియల్ టీమ్");
  const [formIsActive, setFormIsActive] = useState(true);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAnnouncementsAdmin();
      setAnnouncements(data);
    } catch (err: unknown) {
      console.warn("Direct client fetch warning, fetching fallback:", err);
      // Fallback
      try {
        const data = await getAllAnnouncementsAdmin();
        setAnnouncements(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load announcements";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadAnnouncements();
    }
  }, [user, isAdmin]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormTitle("");
    setFormContent("");
    setFormAuthor("కాకతీయ పల్స్ ఎడిటోరియల్ టీమ్");
    setFormIsActive(true);
    setImageFile(null);
    setImageUrl("");
    setImagePreview(null);
    setImageInputMode("upload");
    setFormError(null);
    setShowAddModal(true);
  };

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      if (isEdit) {
        setFormError("దయచేసి JPEG, PNG లేదా WebP ఇమేజ్ మాత్రమే ఎంచుకోండి.");
      } else {
        setFormError("దయచేసి JPEG, PNG లేదా WebP ఇమేజ్ మాత్రమే ఎంచుకోండి.");
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError("ఇమేజ్ సైజు 10MB కంటే తక్కువగా ఉండాలి.");
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

  // Submit New Announcement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("శీర్షిక (Title) నమోదు చేయండి.");
      return;
    }
    if (!formContent.trim()) {
      setFormError("వివరాలు (Content) నమోదు చేయండి.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let finalImageUrl = imageUrl.trim();

      // Upload image to Firebase Storage if a file was selected
      if (imageFile) {
        try {
          finalImageUrl = await uploadPosterImage(imageFile, "announcements");
        } catch (uploadErr) {
          console.warn("Client storage upload failed, checking url fallback:", uploadErr);
          // If storage fails, proceed without image or throw friendly error
          throw new Error("ఇమేజ్ అప్‌లోడ్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.");
        }
      }

      // 1. Try Server Action for reliable server-side Firebase Admin execution
      const actionResult = await createAnnouncementAction({
        title: formTitle.trim(),
        content: formContent.trim(),
        imageUrl: finalImageUrl || undefined,
        isActive: formIsActive,
        authorName: formAuthor.trim() || undefined,
      });

      if (actionResult.success) {
        showSuccess("ప్రకటన విజయవంతంగా ప్రచురించబడింది! (Announcement published successfully)");
        setShowAddModal(false);
        await loadAnnouncements();
      } else {
        // Fallback to client-side Firestore function
        await createAnnouncement({
          title: formTitle.trim(),
          content: formContent.trim(),
          imageUrl: finalImageUrl || undefined,
          isActive: formIsActive,
          authorName: formAuthor.trim() || undefined,
        });
        showSuccess("ప్రకటన విజయవంతంగా ప్రచురించబడింది! (Client Firestore)");
        setShowAddModal(false);
        await loadAnnouncements();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ప్రకటన ప్రచురించడంలో లోపం సంభవించింది.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditAuthor(item.authorName || "");
    setEditIsActive(item.isActive);
    setEditImageUrl(item.imageUrl || "");
    setEditImageFile(null);
    setEditImagePreview(item.imageUrl || null);
    setFormError(null);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editTitle.trim() || !editContent.trim()) {
      setFormError("శీర్షిక మరియు వివరాలు తప్పనిసరి.");
      return;
    }

    try {
      setIsEditing(true);
      setFormError(null);

      let finalImageUrl = editImageUrl;

      if (editImageFile) {
        finalImageUrl = await uploadPosterImage(editImageFile, "announcements");
      }

      const res = await updateAnnouncementAction(editingItem.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        authorName: editAuthor.trim() || undefined,
        isActive: editIsActive,
        imageUrl: finalImageUrl || null,
      });

      if (res.success) {
        showSuccess("ప్రకటన విజయవంతంగా నవీకరించబడింది! (Updated successfully)");
      } else {
        await updateAnnouncement(editingItem.id, {
          title: editTitle.trim(),
          content: editContent.trim(),
          authorName: editAuthor.trim() || undefined,
          isActive: editIsActive,
          imageUrl: finalImageUrl || undefined,
        });
        showSuccess("ప్రకటన విజయవంతంగా నవీకరించబడింది!");
      }

      setEditingItem(null);
      await loadAnnouncements();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "నవీకరణలో లోపం సంభవించింది.";
      setFormError(msg);
    } finally {
      setIsEditing(false);
    }
  };

  // Toggle Active
  const handleToggleActive = async (item: Announcement) => {
    try {
      const newStatus = !item.isActive;
      // Optimistic update
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: newStatus } : a))
      );

      const res = await toggleAnnouncementActiveAction(item.id, newStatus);
      if (!res.success) {
        await toggleAnnouncementActive(item.id, newStatus);
      }
      showSuccess(`ప్రకటన ${newStatus ? "ప్రచురించబడింది (Activated)" : "నిలిపివేయబడింది (Deactivated)"}`);
    } catch (err) {
      console.error("Status toggle error:", err);
      loadAnnouncements();
    }
  };

  // Delete Announcement
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await deleteAnnouncementAction(id);
      if (!res.success) {
        await deleteAnnouncement(id);
      }
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showSuccess("ప్రకటన తొలగించబడింది (Announcement deleted)");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "తొలగించడంలో లోపం సంభవించింది.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout pageTitle="తెలుగు ప్రకటనలు (Telugu Announcements)">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E0] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#14532D]" />
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#14532D]">
                తెలుగు ప్రకటనల నిర్వహణ (Announcements)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              వెబ్‌సైట్‌లో ప్రదర్శించబడే తెలుగు టెక్స్ట్ అప్‌డేట్స్, ప్రెస్ నోట్స్ మరియు ప్రకటనలను ఇక్కడ ప్రచురించండి.
            </p>
          </div>

          <Button
            onClick={openAddModal}
            variant="green"
            size="md"
            className="flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>కొత్త ప్రకటన ప్రచురించు</span>
          </Button>
        </div>

        {/* Success & Error Banners */}
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

        {/* Announcements List */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] flex flex-col items-center justify-center gap-3 text-[#555555]">
            <Loader2 className="w-8 h-8 animate-spin text-[#14532D]" />
            <p className="text-sm font-medium">ప్రకటనలను లోడ్ చేస్తోంది...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] text-center space-y-4">
            <div className="w-16 h-16 bg-[#14532D]/10 text-[#14532D] rounded-full flex items-center justify-center mx-auto">
              <Megaphone className="w-8 h-8 text-[#14532D]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14532D]">ఇంకా ఎలాంటి ప్రకటనలు లేవు</h3>
              <p className="text-xs text-[#555555] mt-1 max-w-md mx-auto">
                వెబ్‌సైట్ హోమ్‌పేజీలో తెలుగు వార్తా ప్రకటనలను ప్రదర్శించడానికి పైనున్న &ldquo;కొత్త ప్రకటన ప్రచురించు&rdquo; బటన్‌ను క్లిక్ చేయండి.
              </p>
            </div>
            <Button onClick={openAddModal} variant="green" size="sm" className="gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> మొదటి ప్రకటనను సృష్టించండి
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  item.isActive ? "border-[#E5E5E0]" : "border-gray-200 bg-gray-50 opacity-80"
                }`}
              >
                {/* Card Top Banner */}
                <div className={`h-1.5 w-full ${item.isActive ? "bg-[#14532D]" : "bg-gray-400"}`} />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Status & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                        item.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                      title="స్థితిని మార్చడానికి క్లిక్ చేయండి"
                    >
                      <span className={`w-2 h-2 rounded-full ${item.isActive ? "bg-emerald-600" : "bg-gray-500"}`} />
                      {item.isActive ? "ప్రచురించబడింది (Live)" : "డ్రాఫ్ట్ (Draft)"}
                    </span>

                    <span className="text-[11px] text-[#777777] font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#C9A227]" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>

                  {/* Thumbnail if present */}
                  {item.imageUrl && (
                    <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-100 aspect-video bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-serif text-base font-bold text-[#14532D] line-clamp-2 mb-2">
                    {item.title}
                  </h3>

                  {/* Content snippet */}
                  <p className="text-xs text-[#444444] line-clamp-3 leading-relaxed flex-1 whitespace-pre-line font-sans">
                    {item.content}
                  </p>

                  {/* Author */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#777777]">
                    <span className="truncate max-w-[180px]">
                      {item.authorName || "ఎడిటోరియల్ టీమ్"}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-[#FAF9F5] px-4 py-2.5 border-t border-[#E5E5E0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-1.5 text-gray-600 hover:text-[#14532D] hover:bg-white rounded transition-colors cursor-pointer"
                      title="ప్రివ్యూ (Preview)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-gray-600 hover:text-[#C9A227] hover:bg-white rounded transition-colors cursor-pointer"
                      title="సవరించు (Edit)"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm("ఈ ప్రకటనను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?")) {
                        handleDelete(item.id);
                      }
                    }}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="తొలగించు (Delete)"
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

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E5E0] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#14532D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C9A227]" />
                <h2 className="font-serif text-lg font-bold">కొత్త ప్రకటనను ప్రచురించండి</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  శీర్షిక / Title (Telugu) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ఉదా: కాకతీయ పల్స్ ప్రత్యేక ప్రెస్ నోట్ & ముఖ్య ప్రకటన..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] focus:outline-none focus:ring-2 focus:ring-[#14532D] text-sm text-[#1C1C1C]"
                />
              </div>

              {/* Content Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  ప్రకటన వివరాలు / Content (Telugu) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="ప్రకటన లేదా సమాచారాన్ని ఇక్కడ తెలుగులో నమోదు చేయండి..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] focus:outline-none focus:ring-2 focus:ring-[#14532D] text-sm text-[#1C1C1C] leading-relaxed"
                />
                <span className="text-[11px] text-[#777777] font-mono">
                  అక్షరాల సంఖ్య: {formContent.length}
                </span>
              </div>

              {/* Image Input Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14532D]">
                    చిత్రం / Image (ఐచ్ఛికం - Optional)
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
                      ఫైల్ అప్‌లోడ్
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
                        <div className="flex flex-col items-center gap-1.5 text-xs text-[#555555]">
                          <Upload className="w-6 h-6 text-[#14532D]" />
                          <span className="font-semibold text-[#14532D]">చిత్రాన్ని ఎంచుకోండి లేదా డ్రాగ్ చేయండి</span>
                          <span>JPEG, PNG, WebP (గరిష్టంగా 10MB)</span>
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
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E0] focus:outline-none focus:ring-2 focus:ring-[#14532D] text-sm text-[#1C1C1C]"
                    />
                  </div>
                )}
              </div>

              {/* Author & Status Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">
                    ప్రచురణకర్త / Author Name
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="కాకతీయ పల్స్ ఎడిటోరియల్ టీమ్"
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-center pt-4">
                  <label className="text-xs font-bold text-[#14532D] cursor-pointer" htmlFor="activeToggle">
                    వెంటనే పబ్లిష్ చేయండి (Publish Live):
                  </label>
                  <input
                    id="activeToggle"
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 accent-[#14532D] cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="green-outline"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  రద్దు చేయండి
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
                      <span>ప్రచురిస్తోంది...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4" />
                      <span>ప్రచురించండి (Publish)</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E5E5E0] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#14532D] text-white flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold">ప్రకటనను సవరించండి (Edit Announcement)</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">శీర్షిక / Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">వివరాలు / Content</label>
                <textarea
                  required
                  rows={5}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-sm text-[#1C1C1C] leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">ఇమేజ్ URL లేదా కొత్త ఫైల్</label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => {
                    setEditImageUrl(e.target.value);
                    setEditImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E5E0] text-xs text-[#1C1C1C]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-[#14532D] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#14532D]"
                  />
                  ప్రచురణలో ఉంచండి (Active)
                </label>
              </div>

              <div className="pt-4 border-t border-[#E5E5E0] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="green-outline"
                  size="md"
                  onClick={() => setEditingItem(null)}
                >
                  రద్దు చేయండి
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  size="md"
                  disabled={isEditing}
                  className="gap-2"
                >
                  {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : "నవీకరించండి (Save Changes)"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E5E5E0] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E0]">
              <span className="text-xs font-bold uppercase text-[#14532D]">లైవ్ ప్రివ్యూ</span>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-500 hover:text-black p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {previewItem.imageUrl && (
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                className="w-full aspect-video object-cover rounded-lg border border-gray-100"
              />
            )}
            <h3 className="font-serif text-xl font-bold text-[#14532D]">
              {previewItem.title}
            </h3>
            <p className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-line font-sans">
              {previewItem.content}
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
