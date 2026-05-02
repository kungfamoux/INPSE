import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload,
  Eye, EyeOff, Star, StarOff, ImageIcon
} from "lucide-react";

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminGalleryCategories() {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", cover_image: "", is_active: true, is_featured: false, sort_order: 0 });
  const [uploading, setUploading] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["gallery-categories"],
    queryFn: () => base44.entities.GalleryCategory.list("sort_order", 100),
  });

  const { data: items = [] } = useQuery({
    queryKey: ["gallery-items-all"],
    queryFn: () => base44.entities.GalleryItem.list("-created_date", 500),
  });

  const itemCountMap = items.reduce((acc, item) => {
    if (item.category_id) acc[item.category_id] = (acc[item.category_id] || 0) + 1;
    return acc;
  }, {});

  const saveMut = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.GalleryCategory.update(editing.id, data)
      : base44.entities.GalleryCategory.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gallery-categories"] }); setShowDialog(false); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.GalleryCategory.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery-categories"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, val }) => base44.entities.GalleryCategory.update(id, { is_active: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery-categories"] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, val }) => base44.entities.GalleryCategory.update(id, { is_featured: val }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery-categories"] }),
  });

  const reorderMut = useMutation({
    mutationFn: async ({ id, direction }) => {
      const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      const idx = sorted.findIndex(c => c.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;
      const a = sorted[idx], b = sorted[swapIdx];
      await Promise.all([
        base44.entities.GalleryCategory.update(a.id, { sort_order: b.sort_order ?? swapIdx }),
        base44.entities.GalleryCategory.update(b.id, { sort_order: a.sort_order ?? idx }),
      ]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery-categories"] }),
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, cover_image: file_url }));
    setUploading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", cover_image: "", is_active: true, is_featured: false, sort_order: categories.length });
    setShowDialog(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", cover_image: cat.cover_image || "", is_active: cat.is_active !== false, is_featured: !!cat.is_featured, sort_order: cat.sort_order || 0 });
    setShowDialog(true);
  };

  const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gallery Categories</h2>
          <p className="text-sm text-gray-400">{categories.length} categories</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white rounded-xl">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Order", "Category", "Items", "Status", "Featured", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && Array(4).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={6}><div className="h-14 m-3 bg-gray-50 rounded animate-pulse" /></td></tr>
            ))}
            {sorted.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => reorderMut.mutate({ id: cat.id, direction: "up" })} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                      <ArrowUp className="w-3 h-3 text-gray-400" />
                    </button>
                    <span className="text-xs text-center text-gray-400 font-mono">{cat.sort_order ?? idx}</span>
                    <button onClick={() => reorderMut.mutate({ id: cat.id, direction: "down" })} disabled={idx === sorted.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30">
                      <ArrowDown className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {cat.cover_image
                        ? <img src={cat.cover_image} alt={cat.name} className="w-full h-full object-cover" />
                        : <ImageIcon className="w-5 h-5 text-gray-300 m-auto mt-3.5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                      {cat.description && <p className="text-xs text-gray-400 truncate max-w-[180px]">{cat.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">{itemCountMap[cat.id] || 0}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive.mutate({ id: cat.id, val: !cat.is_active })}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${cat.is_active !== false ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {cat.is_active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {cat.is_active !== false ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured.mutate({ id: cat.id, val: !cat.is_featured })}
                    className={`p-2 rounded-lg transition ${cat.is_featured ? "text-orange-500 bg-orange-50 hover:bg-orange-100" : "text-gray-300 hover:bg-gray-100"}`}>
                    <Star className="w-4 h-4" fill={cat.is_featured ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(cat)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:bg-red-50 hover:text-red-600"
                      onClick={() => { if (confirm(`Delete "${cat.name}"? Items in this category won't be deleted.`)) deleteMut.mutate(cat.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && sorted.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No categories yet. Add one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showDialog} onOpenChange={v => { if (!v) { setShowDialog(false); setEditing(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editing ? f.slug : toSlug(e.target.value) }))} placeholder="e.g. Sports Day 2025" className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Slug *</label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))} placeholder="auto-generated" className="rounded-xl font-mono text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="text-sm" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Cover Image</label>
              <div className="flex gap-2">
                {form.cover_image && <img src={form.cover_image} alt="cover" className="w-16 h-16 object-cover rounded-xl border" />}
                <label className="flex-1 flex items-center justify-center h-16 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-400 gap-2">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload cover"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
              </div>
              <Input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="or paste URL..." className="rounded-xl text-sm mt-2" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                Active (visible on public gallery)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" />
                Featured
              </label>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Sort Order</label>
              <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="rounded-xl w-24" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button disabled={!form.name || !form.slug || saveMut.isPending}
                onClick={() => saveMut.mutate(form)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                {saveMut.isPending ? "Saving..." : editing ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}