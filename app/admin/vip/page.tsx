"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { VipMember, PublishStatus } from "@/types";
import {
  getAllVipMembersAdmin,
  createVipMember,
  updateVipMember,
  updateVipMemberStatus,
  deleteVipMember,
} from "@/lib/firebase/vip";
import { uploadPosterImage } from "@/lib/firebase/storage";
import {
  UserCheck,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  X,
  MapPin,
  Briefcase,
} from "lucide-react";

export default function AdminVipPage() {
  return (
    <AdminGuard>
      <AdminVipContent />
    </AdminGuard>
  );
}

function AdminVipContent() {
  const { user, isAdmin } = useAuth();
  const [members, setMembers] = useState<VipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<VipMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [category, setCategory] = useState("Leadership");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<PublishStatus>("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllVipMembersAdmin();
      setMembers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load VIP directory.";
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

      await createVipMember({
        name: name.trim(),
        designation: designation.trim(),
        category,
        location: location.trim(),
        bio: bio.trim(),
        posterUrl: finalUrl,
        imageUrl: finalUrl,
        status,
        displayOrder: members.length + 1,
      });

      showSuccess("VIP Member added successfully!");
      setShowAddModal(false);
      setName(""); setDesignation(""); setBio(""); setImageUrl(""); setImageFile(null); setImagePreview(null);
      await loadMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create VIP member.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      setDeletingId(id);
      await deleteVipMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      showSuccess("VIP profile deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout pageTitle="VIP Directory">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E0] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#14532D]" />
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#14532D]">
                VIP Member Directory
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#555555] mt-1">
              Manage distinguished patrons, leaders, and VIP profiles shown across the publication.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            variant="green"
            size="md"
            className="flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add VIP Member</span>
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
            <p className="text-sm font-medium">Loading VIP directory...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-[#E5E5E0] text-center space-y-4">
            <div className="w-16 h-16 bg-[#14532D]/10 text-[#14532D] rounded-full flex items-center justify-center mx-auto">
              <UserCheck className="w-8 h-8 text-[#14532D]" />
            </div>
            <h3 className="text-base font-bold text-[#14532D]">No VIP Members Yet</h3>
            <p className="text-xs text-[#555555] max-w-sm mx-auto">
              Add your first distinguished VIP profile to feature on the VIP directory.
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="green" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add VIP Member
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

                  <h3 className="font-serif text-lg font-bold text-[#14532D]">{m.name}</h3>
                  <p className="text-xs text-[#C9A227] font-semibold flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" /> {m.designation}
                  </p>
                  {m.location && (
                    <p className="text-xs text-[#777777] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {m.location}
                    </p>
                  )}
                  {m.bio && <p className="text-xs text-[#555555] line-clamp-3 mt-2">{m.bio}</p>}
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
              <h2 className="font-serif text-lg font-bold">Add VIP Profile</h2>
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
                  placeholder="e.g. Dr. Rajeshwar Rao"
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
                  placeholder="e.g. President, Kakatiya Heritage Trust"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#555555]">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Warangal / Hyderabad"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Short Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Profile summary and achievements..."
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#14532D]">Photo URL or Image Link</label>
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
