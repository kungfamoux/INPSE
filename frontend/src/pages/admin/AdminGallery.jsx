import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, Upload, Pencil, Star, StarOff, Eye, EyeOff,
  ImageIcon, X, CheckSquare, Square, FolderOpen
} from "lucide-react";

export default function AdminGallery() {
  const qc = useQueryClient();
  const fileInputRef = useRef();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [setCoverDialog, setSetCoverDialog] = useState(null); // category id
  const [selectedItems, setSelectedItems] = useState(new Set());

  const { data: categories = [] } = useQuery({
    queryKey: ["gallery-categories"],
    queryFn: () => base44.entities.GalleryCategory.list("sort_order", 100),
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["gallery-admin"],
    queryFn: () => base44.entities.GalleryItem.list("-created_date", 500),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GalleryItem.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gallery-admin"] }); setEditItem(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.GalleryItem.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gallery-admin"] }); setSelectedItems(new Set()); },
  });

  const bulkDeleteMut = useMutation({
    mutationFn: async (ids) => { for (const id of ids) await base44.entities.GalleryItem.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["gallery-admin"] }); setSelectedItems(new Set()); },
  });

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const filtered = categoryFilter === "all" ? items : items.filter(i => i.category_id === categoryFilter);

  // Bulk upload
  const handleBulkFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setBulkFiles(files);
  };

  const runBulkUpload = async () => {
    if (!bulkFiles.length || !bulkCategoryId) return;
    setBulkUploading(true);
    setBulkProgress(0);
    for (let i = 0; i < bulkFiles.length; i++) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: bulkFiles[i] });
      await base44.entities.GalleryItem.create({
        image_url: file_url,
        caption: bulkFiles[i].name.replace(/\.[^.]+$/, ""),
        category_id: bulkCategoryId,
        is_published: true,
        is_featured: false,
        sort_order: 0,
      });
      setBulkProgress(Math.round(((i + 1) / bulkFiles.length) * 100));
    }
    qc.invalidateQueries({ queryKey: ["gallery-admin"] });
    qc.invalidateQueries({ queryKey: ["gallery-items-all"] });
    setBulkFiles([]);
    setBulkUploading(false);
    setShowAddDialog(false);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({ caption: item.caption || "", category_id: item.category_id || "", tags: item.tags || [], is_featured: !!item.is_featured, is_published: item.is_published !== false, event_date: item.event_date || "" });
    setTagInput("");
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !editForm.tags.includes(t)) { setEditForm(f => ({ ...f, tags: [...f.tags, t] })); }
    setTagInput("");
  };

  const handleSetCover = async (item) => {
    if (!setCoverDialog) return;
    await base44.entities.GalleryCategory.update(setCoverDialog, { cover_image: item.image_url });
    qc.invalidateQueries({ queryKey: ["gallery-categories"] });
    setSetCoverDialog(null);
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const sortedCategories = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {sortedCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400">{filtered.length} photos</span>
        </div>
        <div className="flex gap-2">
          {selectedItems.size > 0 && (
            <Button size="sm" variant="outline" className="gap-2 text-red-500 border-red-200 hover:bg-red-50 rounded-xl"
              onClick={() => { if (confirm(`Delete ${selectedItems.size} items?`)) bulkDeleteMut.mutate([...selectedItems]); }}>
              <Trash2 className="w-4 h-4" /> Delete ({selectedItems.size})
            </Button>
          )}
          {categoryFilter !== "all" && (
            <Button size="sm" variant="outline" className="gap-2 rounded-xl" onClick={() => setSetCoverDialog(categoryFilter)}>
              <ImageIcon className="w-4 h-4" /> Set Category Cover
            </Button>
          )}
          <Button size="sm" onClick={() => { setBulkFiles([]); setBulkCategoryId(categoryFilter !== "all" ? categoryFilter : ""); setShowAddDialog(true); }}
            className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white rounded-xl">
            <Plus className="w-4 h-4" /> Add Photos
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-400">No photos yet in this category.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => {
            const selected = selectedItems.has(item.id);
            return (
              <div key={item.id} className={`group relative aspect-square rounded-xl overflow-hidden shadow-sm ring-2 transition ${selected ? "ring-orange-400" : "ring-transparent"}`}>
                <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                {/* Select checkbox */}
                <button onClick={() => toggleSelect(item.id)} className="absolute top-2 left-2 p-1 bg-white/80 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  {selected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4 text-gray-500" />}
                </button>

                {/* Featured star */}
                {item.is_featured && <div className="absolute top-2 right-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow" /></div>}

                {/* Unpublished overlay */}
                {item.is_published === false && (
                  <div className="absolute top-2 right-2 bg-gray-800/70 rounded px-1.5 py-0.5 text-[10px] text-white">hidden</div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-medium line-clamp-1 mb-1">{item.caption || "No caption"}</p>
                  <p className="text-white/60 text-[10px] mb-2">{catMap[item.category_id]?.name || "Uncategorized"}</p>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="flex-1 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs flex items-center justify-center gap-1">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => { if (confirm("Delete?")) deleteMut.mutate(item.id); }} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={v => !bulkUploading && setShowAddDialog(v)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Photos</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Category *</label>
              <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  {sortedCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Images (multiple allowed)</label>
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-orange-50 transition-colors bg-gray-50 gap-2">
                <Upload className="w-6 h-6 text-orange-400" />
                <span className="text-sm text-gray-500">Click to select images</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP, etc.</span>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleBulkFiles} />
              </label>
              {bulkFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 font-medium">{bulkFiles.length} file(s) selected:</p>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {bulkFiles.map((f, i) => (
                      <div key={i} className="flex justify-between text-xs bg-gray-50 rounded px-2 py-1">
                        <span className="truncate text-gray-700">{f.name}</span>
                        <span className="text-gray-400 ml-2">{(f.size / 1024).toFixed(0)}KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {bulkUploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Uploading...</span><span>{bulkProgress}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all" style={{ width: `${bulkProgress}%` }} /></div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={bulkUploading}>Cancel</Button>
              <Button disabled={!bulkFiles.length || !bulkCategoryId || bulkUploading} onClick={runBulkUpload}
                className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                {bulkUploading ? `Uploading ${bulkProgress}%...` : `Upload ${bulkFiles.length} Photo${bulkFiles.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editItem} onOpenChange={v => !v && setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Photo</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <img src={editItem.image_url} alt="" className="w-full h-40 object-cover rounded-xl" />
              <div>
                <label className="text-sm font-medium block mb-1.5">Caption</label>
                <Input value={editForm.caption} onChange={e => setEditForm(f => ({ ...f, caption: e.target.value }))} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Category</label>
                <Select value={editForm.category_id} onValueChange={v => setEditForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {sortedCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Event Date</label>
                <Input type="date" value={editForm.event_date} onChange={e => setEditForm(f => ({ ...f, event_date: e.target.value }))} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(editForm.tags || []).map(t => (
                    <span key={t} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 rounded px-2 py-0.5 text-xs">
                      {t}
                      <button onClick={() => setEditForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add tag, press Enter" className="rounded-xl text-sm flex-1" />
                  <Button size="sm" variant="outline" onClick={addTag} className="rounded-xl">Add</Button>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editForm.is_featured} onChange={e => setEditForm(f => ({ ...f, is_featured: e.target.checked }))} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editForm.is_published} onChange={e => setEditForm(f => ({ ...f, is_published: e.target.checked }))} />
                  Published
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
                <Button onClick={() => updateMut.mutate({ id: editItem.id, data: editForm })} disabled={updateMut.isPending}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                  {updateMut.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Set Category Cover Dialog */}
      <Dialog open={!!setCoverDialog} onOpenChange={v => !v && setSetCoverDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Set Category Cover Image</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">Click a photo to use it as the cover for <strong>{catMap[setCoverDialog ?? ""]?.name}</strong>.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
            {items.filter(i => i.category_id === setCoverDialog).map(item => (
              <button key={item.id} onClick={() => handleSetCover(item)} className="aspect-square rounded-xl overflow-hidden hover:ring-4 ring-orange-400 transition">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}