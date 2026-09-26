"use client";

import React, { useEffect, useState, useRef } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Magazine, PublishStatus } from "@/types";
import {
  getAllMagazinesAdmin,
  createMagazine,
  updateMagazineStatus,
  updateMagazine,
  deleteMagazine,
} from "@/lib/firebase/magazines";
import { uploadMagazinePdf, uploadMagazineCoverImage } from "@/lib/firebase/storage";
import { ensureAdminAuth } from "@/lib/firebase/auth";
import dynamic from "next/dynamic";
import {
  Plus, X, Eye, Edit, Trash2, BookOpen, Upload, ImageIcon,
  CheckCircle, AlertCircle, Loader2, FileText, Download,
} from "lucide-react";

const FlipbookReaderModal = dynamic(
  () => import("@/components/flipbook-reader-modal").then((mod) => mod.FlipbookReaderModal),
  { ssr: false }
);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AdminMagazinesPage() {
  return (
    <AdminGuard>
      <AdminMagazinesContent />
    </AdminGuard>
  );
}

function AdminMagazinesContent() {
  const { user, isAdmin } = useAuth();
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewMagazine, setPreviewMagazine] = useState<Magazine | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add form state
  const [formTitle, setFormTitle] = useState("");
  const [formYear, setFormYear] = useState(new Date().getFullYear());
  const [formEditionLabel, setFormEditionLabel] = useState("");
  const [formPageCount, setFormPageCount] = useState<number>(64);
  const [formDescription, setFormDescription] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<PublishStatus>("published");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState<"" | "cover" | "pdf" | "saving" | "done">("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editYear, setEditYear] = useState(2026);
  const [editEditionLabel, setEditEditionLabel] = useState("");
  const [editPageCount, setEditPageCount] = useState(64);
  const [editDescription, setEditDescription] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editStatus, setEditStatus] = useState<PublishStatus>("published");
  const [isEditing, setIsEditing] = useState(false);

  const loadMagazines = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await getAllMagazinesAdmin();
      setMagazines(docs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch magazine records.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) loadMagazines();
  }, [user, isAdmin]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const openAddModal = () => {
    setFormTitle(""); setFormYear(new Date().getFullYear());
    setFormEditionLabel(""); setFormPageCount(64);
    setFormDescription(""); setFormFeatured(false);
    setFormStatus("published"); setCoverFile(null);
    setCoverPreview(null); setPdfFile(null);
    setFormError(null); setUploadStep(""); setUploadProgress(0);
    setShowAddModal(true);
  };

  const handleCoverChange = (file: File | null) => {
    if (!file) { setCoverFile(null); setCoverPreview(null); return; }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormError("Cover image must be JPEG, PNG, or WebP."); return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormError("Cover image exceeds 10MB limit."); return;
    }
    setFormError(null);
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (file: File | null) => {
    if (!file) { setPdfFile(null); return; }
    if (file.type !== "application/pdf") {
      setFormError("Document must be a PDF file."); return;
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      setFormError("PDF exceeds 50MB limit. Please compress before uploading."); return;
    }
    setFormError(null);
    setPdfFile(file);
  };

  const handleCreateMagazine = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formTitle.trim()) { setFormError("Edition title is required."); return; }
    if (!coverFile) { setFormError("Please select a cover image."); return; }
    if (!pdfFile) { setFormError("Please select a PDF file."); return; }

    try {
      setIsSubmitting(true);
      setUploadProgress(5);

      await ensureAdminAuth();
      setUploadProgress(10);

      setUploadStep("cover");
      setUploadProgress(20);
      const coverImageUrl = await uploadMagazineCoverImage(coverFile, "magazines/covers");
      setUploadProgress(50);

      setUploadStep("pdf");
      const pdfUrl = await uploadMagazinePdf(pdfFile, "magazines/pdfs");
      setUploadProgress(85);

      setUploadStep("saving");
      await createMagazine({
        title: formTitle.trim(),
        year: Number(formYear),
        ...(formEditionLabel.trim() ? { month: formEditionLabel.trim() } : {}),
        pageCount: Number(formPageCount),
        description: formDescription.trim(),
        featured: formFeatured,
        status: formStatus,
        coverImageUrl,
        pdfUrl,
      });
      setUploadProgress(100);
      setUploadStep("done");

      showSuccess(`Edition "${formTitle}" published successfully.`);
      setShowAddModal(false);
      await loadMagazines();
    } catch (err: unknown) {
      console.error("Magazine publishing error:", err);
      const msg = err instanceof Error ? err.message : "Upload failed. Please check your connection and try again.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStep("");
      setUploadProgress(0);
    }
  };

  const handleOpenEdit = (mag: Magazine) => {
    setEditingMagazine(mag);
    setEditTitle(mag.title);
    setEditYear(mag.year);
    setEditEditionLabel(mag.month || "");
    setEditPageCount(mag.pageCount || mag.pages || 64);
    setEditDescription(mag.description || "");
    setEditFeatured(Boolean(mag.featured));
    setEditStatus(mag.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMagazine) return;
    try {
      setIsEditing(true);
      await updateMagazine(editingMagazine.id, {
        title: editTitle.trim(),
        year: Number(editYear),
        ...(editEditionLabel.trim() ? { month: editEditionLabel.trim() } : {}),
        pageCount: Number(editPageCount),
        description: editDescription.trim(),
        featured: editFeatured,
        status: editStatus,
      });
      showSuccess(`Updated "${editTitle}" successfully.`);
      setEditingMagazine(null);
      await loadMagazines();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update edition.";
      alert(msg);
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleStatus = async (mag: Magazine) => {
    try {
      const newStatus: PublishStatus = mag.status === "published" ? "draft" : "published";
      await updateMagazineStatus(mag.id, newStatus);
      setMagazines((prev) => prev.map((m) => m.id === mag.id ? { ...m, status: newStatus } : m));
      showSuccess(`"${mag.title}" is now ${newStatus}.`);
    } catch {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteMagazine(id);
      setMagazines((prev) => prev.filter((m) => m.id !== id));
      setConfirmDeleteId(null);
      showSuccess("Edition removed from the publication archive.");
    } catch {
      setError("Failed to delete edition.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminLayout pageTitle="Magazine Publications">
      {/* Feedback banners */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-600" />{error}</div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#C9A227] font-semibold mb-1">Editorial Media</p>
          <h2 className="font-serif text-2xl font-bold text-[#14532D]">Special Editions</h2>
        </div>
        <Button variant="green" onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Edition
        </Button>
      </div>

      {/* Magazine Table */}
      {loading ? (
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#14532D] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#555555]">Loading publications from Firestore...</p>
        </div>
      ) : magazines.length === 0 ? (
        <div className="bg-white border border-[#E5E5E0] rounded-xl p-16 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-[#C9A227] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#14532D]">No Editions Published Yet</h3>
          <p className="text-sm text-[#555555] max-w-sm mx-auto">
            Upload your first special edition to begin building the publication archive.
          </p>
          <Button variant="green" onClick={openAddModal} className="mt-2">
            <Plus className="w-4 h-4 mr-2" /> Add First Edition
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F7F3] border-b border-[#E5E5E0]">
                <tr className="text-[11px] uppercase tracking-wider text-[#14532D] font-semibold font-serif">
                  <th className="py-3 px-5">Cover</th>
                  <th className="py-3 px-5">Title</th>
                  <th className="py-3 px-5">Year</th>
                  <th className="py-3 px-5">Pages</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">PDF</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F7F3]">
                {magazines.map((mag) => (
                  <tr key={mag.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="w-10 h-14 rounded border border-[#E5E5E0] overflow-hidden bg-[#F8F7F3] relative">
                        {mag.coverImageUrl ? (
                          <img src={mag.coverImageUrl} alt={mag.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-[#E5E5E0]" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <p className="font-semibold text-[#1C1C1C] text-sm">{mag.title}</p>
                      {mag.month && <p className="text-xs text-[#C9A227] mt-0.5">{mag.month}</p>}
                      {mag.featured && (
                        <span className="inline-block text-[10px] text-[#14532D] bg-[#14532D]/10 border border-[#14532D]/20 px-1.5 py-0.5 rounded mt-1 font-semibold">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-[#555555] font-mono text-xs font-semibold">{mag.year}</td>
                    <td className="py-3 px-5 text-[#555555] font-mono text-xs">{mag.pageCount || mag.pages || "—"}</td>
                    <td className="py-3 px-5">
                      <button
                        onClick={() => handleToggleStatus(mag)}
                        className="cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        <Badge variant={mag.status === "published" ? "success" : "neutral"}>
                          {mag.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3 px-5">
                      {mag.pdfUrl ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewMagazine(mag)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#14532D] hover:text-[#166534] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <a
                            href={mag.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#555555] hover:text-[#14532D] transition-colors"
                            download
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-[#E5E5E0]">No PDF</span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(mag)}
                          className="p-1.5 rounded-lg text-[#555555] hover:text-[#14532D] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
                          title="Edit metadata"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(mag.id)}
                          className="p-1.5 rounded-lg text-[#555555] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete edition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E5E5E0] shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
            <div className="border-b border-[#E5E5E0] px-6 py-5 flex items-center justify-between bg-[#F8F7F3]">
              <div>
                <div className="h-[2px] w-8 bg-[#C9A227] mb-2" />
                <h2 className="font-serif text-xl font-bold text-[#14532D]">Add Special Edition</h2>
                <p className="text-xs text-[#555555] mt-0.5">Upload cover and PDF to Firebase Storage, then save to Firestore.</p>
              </div>
              <button
                onClick={() => !isSubmitting && setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E5E5E0] text-[#555555] hover:text-[#14532D] hover:border-[#14532D] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}

            <form onSubmit={handleCreateMagazine} className="p-6 space-y-5">
              {/* Title & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Edition Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KakatiyaPulse Special Edition 2026"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1C] bg-[#F8F7F3] focus:outline-none focus:border-[#14532D] placeholder-[#999]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Year *</label>
                  <input
                    type="number"
                    required
                    min={2000} max={2100}
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1C] bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>

              {/* Edition Label & Page Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Edition Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Edition, Special Issue"
                    value={formEditionLabel}
                    onChange={(e) => setFormEditionLabel(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1C] bg-[#F8F7F3] focus:outline-none focus:border-[#14532D] placeholder-[#999]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Page Count</label>
                  <input
                    type="number"
                    min={1}
                    value={formPageCount}
                    onChange={(e) => setFormPageCount(Number(e.target.value))}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1C] bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief editorial summary of this edition..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1C] bg-[#F8F7F3] focus:outline-none focus:border-[#14532D] resize-none placeholder-[#999]"
                />
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Publish Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PublishStatus)}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm text-[#1C1C1C] bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
                <div className="flex items-center gap-2.5 mt-4 sm:mt-0 pt-4 sm:pt-0">
                  <input
                    type="checkbox"
                    id="formFeatured"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5E5E0] text-[#14532D] focus:ring-[#14532D]"
                  />
                  <label htmlFor="formFeatured" className="text-sm text-[#1C1C1C] cursor-pointer font-medium">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              <hr className="border-[#E5E5E0]" />

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">
                  Cover Image * <span className="normal-case font-normal text-[#555555]">(JPEG, PNG, WebP — max 10MB)</span>
                </label>
                <div
                  onClick={() => !isSubmitting && coverInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
                    coverFile ? "border-[#14532D] bg-[#14532D]/5" : "border-[#E5E5E0] hover:border-[#C9A227] bg-[#F8F7F3] hover:bg-[#C9A227]/5"
                  }`}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
                  />
                  {coverFile && coverPreview ? (
                    <div className="flex items-center gap-4">
                      <img src={coverPreview} alt="Preview" className="w-16 h-20 object-cover rounded-lg border border-[#E5E5E0] shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#14532D] truncate">{coverFile.name}</p>
                        <p className="text-xs text-[#555555] mt-0.5">{formatBytes(coverFile.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = ""; }}
                          className="text-xs text-red-600 hover:text-red-800 mt-1 transition-colors"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="w-6 h-6 text-[#C9A227] mx-auto" />
                      <p className="text-sm text-[#555555]">Click or drag to upload cover image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">
                  Magazine PDF * <span className="normal-case font-normal text-[#555555]">(PDF — max 50MB)</span>
                </label>
                <div
                  onClick={() => !isSubmitting && pdfInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
                    pdfFile ? "border-[#14532D] bg-[#14532D]/5" : "border-[#E5E5E0] hover:border-[#C9A227] bg-[#F8F7F3] hover:bg-[#C9A227]/5"
                  }`}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handlePdfChange(e.target.files?.[0] || null)}
                  />
                  {pdfFile ? (
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-[#14532D] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#14532D] truncate">{pdfFile.name}</p>
                        <p className="text-xs text-[#555555] mt-0.5">{formatBytes(pdfFile.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPdfFile(null); if (pdfInputRef.current) pdfInputRef.current.value = ""; }}
                          className="text-xs text-red-600 hover:text-red-800 mt-1 transition-colors"
                        >
                          Remove PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="w-6 h-6 text-[#C9A227] mx-auto" />
                      <p className="text-sm text-[#555555]">Click or drag to upload PDF file</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isSubmitting && (
                <div className="bg-[#F8F7F3] border border-[#E5E5E0] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[#14532D] font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {uploadStep === "cover" && "Uploading cover image to Firebase Storage..."}
                    {uploadStep === "pdf" && "Uploading magazine PDF to Firebase Storage..."}
                    {uploadStep === "saving" && "Saving edition metadata to Firestore..."}
                    {uploadStep === "done" && "Edition published successfully!"}
                  </div>
                  <div className="w-full h-2 bg-[#E5E5E0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14532D] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#555555] font-mono">{uploadProgress}% complete</p>
                </div>
              )}

              {/* Bottom error display so it's always in view */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E5E0]">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  disabled={isSubmitting || !coverFile || !pdfFile}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Uploading...</span>
                  ) : (
                    "Publish Edition"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editingMagazine && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5E0] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="border-b border-[#E5E5E0] px-6 py-5 flex items-center justify-between bg-[#F8F7F3]">
              <div>
                <div className="h-[2px] w-8 bg-[#C9A227] mb-2" />
                <h2 className="font-serif text-xl font-bold text-[#14532D]">Edit Edition Metadata</h2>
              </div>
              <button
                onClick={() => setEditingMagazine(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E5E5E0] text-[#555555] hover:text-[#14532D] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Title *</label>
                  <input
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Year *</label>
                  <input
                    type="number"
                    required
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Edition Label</label>
                  <input
                    value={editEditionLabel}
                    placeholder="e.g. Annual Edition"
                    onChange={(e) => setEditEditionLabel(e.target.value)}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm bg-[#F8F7F3] focus:outline-none focus:border-[#14532D] placeholder-[#999]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Page Count</label>
                  <input
                    type="number"
                    value={editPageCount}
                    onChange={(e) => setEditPageCount(Number(e.target.value))}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm bg-[#F8F7F3] focus:outline-none focus:border-[#14532D] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PublishStatus)}
                    className="w-full border border-[#E5E5E0] rounded-lg px-3 py-2.5 text-sm bg-[#F8F7F3] focus:outline-none focus:border-[#14532D]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-center gap-2.5 pt-4">
                  <input
                    type="checkbox"
                    id="editFeatured"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E5E5E0] text-[#14532D]"
                  />
                  <label htmlFor="editFeatured" className="text-sm text-[#1C1C1C] cursor-pointer font-medium">Featured</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E5E0]">
                <Button type="button" variant="ghost" disabled={isEditing} onClick={() => setEditingMagazine(null)}>Cancel</Button>
                <Button type="submit" variant="green" disabled={isEditing}>
                  {isEditing ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E5E0] shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#1C1C1C]">Delete this edition?</h3>
            <p className="text-sm text-[#555555]">
              This removes the Firestore record. The PDF and cover files in Firebase Storage are retained.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button
                variant="danger"
                disabled={deletingId === confirmDeleteId}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Deleting...</span> : "Delete Edition"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Flipbook Preview */}
      <FlipbookReaderModal magazine={previewMagazine} onClose={() => setPreviewMagazine(null)} />
    </AdminLayout>
  );
}
