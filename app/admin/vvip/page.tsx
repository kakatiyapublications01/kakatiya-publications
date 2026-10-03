"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { VvipMember, PublishStatus } from "@/types";
import {
  getAllVvipMembersAdmin,
  createVvipMember,
  updateVvipMember,
  updateVvipMemberStatus,
  deleteVvipMember,
} from "@/lib/firebase/vvip";
import { uploadPosterImage } from "@/lib/firebase/storage";
import {
  Crown,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Award,
} from "lucide-react";

export default function AdminVvipPage() {
  return (
    <AdminGuard>
      <AdminVvipContent />
    </AdminGuard>
  );
}

function AdminVvipContent() {
  const { user, isAdmin } = useAuth();
  const [members, setMembers] = useState<VvipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [badge, setBadge] = useState("Distinguished Patron");
  const [bio, setBio] = useState("");
  const [quote, setQuote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PublishStatus>("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllVvipMembersAdmin();
      setMembers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load VVIP directory.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) loadMembers();
  }, [user, isAdmin]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim()) {
      setFormError("Name and Designation are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      let finalUrl = imageUrl.trim();
      if (imageFile) {
        finalUrl = await uploadPosterImage(imageFile, "posters");
      }

      await createVvipMember({
        name: name.trim(),
        designation: designation.trim(),
        badge: badge.trim(),
        prestigeBadge: badge.trim(),
        bio: bio.trim(),
        detailedProfile: bio.trim(),
        quote: quote.trim(),
        posterUrl: finalUrl,
        imageUrl: finalUrl,
        isFeatured: true,
        status,
        displayOrder: members.length + 1,
      });

      showSuccess("VVIP Profile created successfully!");
      setShowAddModal(false);
      setName(""); setDesignation(""); setBio(""); setQuote(""); setImageUrl(""); setImageFile(null);
      await loadMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create VVIP.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this VVIP profile?")) return;
    try {
      setDeletingId(id);
      await deleteVvipMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      showSuccess("VVIP profile deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout pageTitle="VVIP Spotlight">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E0] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#C9A227]" />
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#14532D]">
                VVIP Spotlight &amp; Dignitaries
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Curate and manage high-profile guest dignitaries and featured patrons.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            variant="green"
            size="md"
            className="flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add VVIP Member</span>
          </Button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 text-sm">
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

        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] flex flex-col items-center justify-center gap-3 text-[#555555]">
            <Loader2 className="w-8 h-8 animate-spin text-[#14532D]" />
            <p className="text-sm font-medium">Loading VVIP directory...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] text-center space-y-4">
            <div className="w-16 h-16 bg-[#C9A227]/15 text-[#C9A227] rounded-full flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-[#C9A227]" />
            </div>
            <h3 className="text-base font-bold text-[#14532D]">No VVIP Profiles Yet</h3>
            <p className="text-xs text-[#555555] max-w-sm mx-auto">
              Highlight eminent leaders and patrons in the VVIP Spotlight.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="green" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add VVIP Member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-[#E5E5E0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col">
                  {m.posterUrl || m.imageUrl ? (
                    <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-100 aspect-square max-h-56 bg-gray-100">
                      <img
                        src={m.posterUrl || m.imageUrl}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1.5 text-xs text-[#C9A227] font-semibold mb-1">
                    <Award className="w-3.5 h-3.5" /> {m.badge || m.prestigeBadge || "VVIP Patron"}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#14532D]">{m.name}</h3>
                  <p className="text-xs text-[#555555]">{m.designation}</p>

                  {m.quote && (
                    <blockquote className="mt-2 text-xs italic text-[#1C1C1C] border-l-2 border-[#C9A227] pl-2 line-clamp-2">
                      &ldquo;{m.quote}&rdquo;
                    </blockquote>
                  )}
                </div>

                <div className="bg-[#FAF9F5] px-4 py-2.5 border-t border-[#E5E5E0] flex items-center justify-between">
                  <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                    m.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                  }`}>
                    {m.status}
                  </span>

                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    {deletingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5E5E0] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#14532D] text-white flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold">Add VVIP Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smt. K. Surekha"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Designation / Title *</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Hon'ble Minister, Govt. of Telangana"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#555555]">Prestige Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Chief Guest / Keynote Dignitary"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Eminent Quote</label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Inspiring words or tribute to the community..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Detailed Profile / Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Biography and career highlights..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Portrait / Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="button" variant="green-outline" size="md" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="green" size="md" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save VVIP Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
