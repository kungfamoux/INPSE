import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plus, Pencil, Trash2, Star, Eye, EyeOff, Upload, GripVertical, Users
} from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80";

const EMPTY_FORM = {
  full_name: "", position: "", department: "", bio: "",
  photo_url: "", email: "", phone: "", qualifications: "",
  specialization: "", years_of_experience: "", linkedin_url: "",
  facebook_url: "", is_published: true, is_featured: false, sort_order: 0,
};

export default function AdminTeam({ currentUser }) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members-admin"],
    queryFn: () => base44.entities.TeamMember.list("sort_order", 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.TeamMember.update(editing.id, data)
      : base44.entities.TeamMember.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["team-members-admin"] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["team-members-admin"] }); setDeleteConfirm(null); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team-members-admin"] }),
  });

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({ ...EMPTY_FORM, ...m, years_of_experience: m.years_of_experience ?? "" });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, photo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      years_of_experience: form.years_of_experience !== "" ? Number(form.years_of_experience) : undefined,
      sort_order: Number(form.sort_order) || 0,
    };
    saveMutation.mutate(data);
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Our Team</h1>
          <p className="text-sm text-gray-500 mt-1">{members.length} member{members.length !== 1 ? "s" : ""} · Manage staff profiles displayed on the About page</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Members", value: members.length, color: "bg-blue-50 text-blue-700" },
          { label: "Published", value: members.filter(m => m.is_published).length, color: "bg-green-50 text-green-700" },
          { label: "Featured", value: members.filter(m => m.is_featured).length, color: "bg-orange-50 text-orange-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No team members yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Member" to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">Member</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide hidden md:table-cell">Department</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide hidden lg:table-cell">Order</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.photo_url || FALLBACK}
                        alt={m.full_name}
                        onError={e => { e.target.src = FALLBACK; }}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900">{m.full_name}</p>
                          {m.is_featured && <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />}
                        </div>
                        <p className="text-xs text-gray-400">{m.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {m.department ? <Badge variant="secondary" className="text-xs">{m.department}</Badge> : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-400">{m.sort_order ?? 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: m.id, data: { is_published: !m.is_published } })}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        m.is_published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {m.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {m.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)} className="h-8 w-8 p-0">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(m)} className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <img src={form.photo_url || FALLBACK} alt="" onError={e => { e.target.src = FALLBACK; }} className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Profile Photo</Label>
                <label className="cursor-pointer flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
                <p className="text-xs text-gray-400 mt-0.5">Or paste a URL below</p>
                <Input
                  placeholder="https://..."
                  value={form.photo_url}
                  onChange={e => f("photo_url", e.target.value)}
                  className="mt-1.5 h-8 text-xs"
                />
              </div>
            </div>

            {/* Name + Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input required value={form.full_name} onChange={e => f("full_name", e.target.value)} placeholder="e.g. Mrs. Adaeze Okafor" className="mt-1" />
              </div>
              <div>
                <Label>Position / Title *</Label>
                <Input required value={form.position} onChange={e => f("position", e.target.value)} placeholder="e.g. Head Teacher" className="mt-1" />
              </div>
            </div>

            {/* Department + Sort */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department / Category</Label>
                <Input value={form.department} onChange={e => f("department", e.target.value)} placeholder="e.g. Leadership, Teaching Staff" className="mt-1" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={e => f("sort_order", e.target.value)} placeholder="0" className="mt-1" />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label>Short Bio</Label>
              <Textarea value={form.bio} onChange={e => f("bio", e.target.value)} placeholder="Brief professional summary..." className="mt-1 h-24 resize-none" />
            </div>

            {/* Qualifications + Specialization */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Qualifications</Label>
                <Input value={form.qualifications} onChange={e => f("qualifications", e.target.value)} placeholder="e.g. B.Ed, M.Sc" className="mt-1" />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input value={form.specialization} onChange={e => f("specialization", e.target.value)} placeholder="e.g. Mathematics" className="mt-1" />
              </div>
            </div>

            {/* Experience + Email + Phone */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Years of Experience</Label>
                <Input type="number" min="0" value={form.years_of_experience} onChange={e => f("years_of_experience", e.target.value)} placeholder="e.g. 10" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="optional" className="mt-1" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="optional" className="mt-1" />
              </div>
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={form.linkedin_url} onChange={e => f("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." className="mt-1" />
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input value={form.facebook_url} onChange={e => f("facebook_url", e.target.value)} placeholder="https://facebook.com/..." className="mt-1" />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-8 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Switch id="published" checked={form.is_published} onCheckedChange={v => f("is_published", v)} />
                <Label htmlFor="published" className="cursor-pointer">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="featured" checked={form.is_featured} onCheckedChange={v => f("is_featured", v)} />
                <Label htmlFor="featured" className="cursor-pointer">Featured Member</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90">
                {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Team Member?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Are you sure you want to remove <strong>{deleteConfirm?.full_name}</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}