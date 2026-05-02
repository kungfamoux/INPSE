import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, Save, Upload, Star, Eye, EyeOff, ImageIcon, Loader2 } from "lucide-react";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────
function CategoriesTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", coverImageUrl: "", sortOrder: 0, isActive: true, isFeatured: false });
  const [uploading, setUploading] = useState(false);

  const { data: cats = [] } = useQuery({
    queryKey: ["gallery-cats-admin"],
    queryFn: () => base44.entities.GalleryCategory.list("sort_order", 200),
  });
  const { data: items = [] } = useQuery({
    queryKey: ["gallery-items-admin-count"],
    queryFn: () => base44.entities.GalleryItem.list("-created_date", 1000),
  });

  const saveMut = useMutation({
    mutationFn: (d) => {
      const payload = { name: d.name, slug: d.slug, description: d.description, cover_image: d.coverImageUrl, sort_order: d.sortOrder, is_active: d.isActive, is_featured: d.isFeatured };
      return modal?.id ? base44.entities.GalleryCategory.update(modal.id, payload) : base44.entities.GalleryCategory.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries(["gallery-cats-admin"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.GalleryCategory.delete(id),
    onSuccess: () => qc.invalidateQueries(["gallery-cats-admin"]),
  });

  const openCreate = () => {
    setForm({ name: "", slug: "", description: "", coverImageUrl: "", sortOrder: cats.length, isActive: true, isFeatured: false });
    setModal({});
  };
  const openEdit = (c) => {
    setForm({ name: c.name || "", slug: c.slug || "", description: c.description || "", coverImageUrl: c.cover_image || "", sortOrder: c.sort_order || 0, isActive: c.is_active !== false, isFeatured: c.is_featured || false });
    setModal(c);
  };

  const upload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, coverImageUrl: file_url }));
    setUploading(false);
  };

  const slugify = (s) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{cats.length} categor{cats.length !== 1 ? "ies" : "y"}</p>
        <Button size="sm" onClick={openCreate} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0"><Plus className="w-4 h-4 mr-1" />New Category</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(c => {
          const count = items.filter(i => i.category_id === c.id).length;
          return (
            <div key={c.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${c.is_active === false ? "opacity-60" : ""}`}>
              {c.cover_image
                ? <img src={c.cover_image} alt={c.name} className="w-full h-32 object-cover" />
                : <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-orange-300" /></div>
              }
              <div className="p-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                  {c.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />}
                  <Badge className={c.is_active !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{c.is_active !== false ? "Active" : "Hidden"}</Badge>
                </div>
                <p className="text-xs text-gray-400">{count} photo{count !== 1 ? "s" : ""}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="flex-1"><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? "Edit Category" : "New Category"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Name</label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Slug</label>
                <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description (optional)</label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Cover Image</label>
              <div className="flex gap-2">
                <Input value={form.coverImageUrl} onChange={e => setForm(p => ({ ...p, coverImageUrl: e.target.value }))} placeholder="https://..." className="flex-1" />
                <label className="cursor-pointer flex-shrink-0"><div className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm">{uploading ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}</div><input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />Featured</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                {saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-1" />Save</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Gallery Items ────────────────────────────────────────────────
function ItemsTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ imageUrl: "", categoryId: "", caption: "", eventDate: "", tags: [], sortOrder: 0, isFeatured: false });
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const { data: cats = [] } = useQuery({
    queryKey: ["gallery-cats-admin"],
    queryFn: () => base44.entities.GalleryCategory.list("sort_order", 200),
  });
  const { data: items = [] } = useQuery({
    queryKey: ["gallery-items-admin"],
    queryFn: () => base44.entities.GalleryItem.list("-created_date", 500),
  });

  const saveMut = useMutation({
    mutationFn: (d) => {
      const payload = { image_url: d.imageUrl, category_id: d.categoryId || null, caption: d.caption, event_date: d.eventDate, tags: d.tags, sort_order: d.sortOrder, is_featured: d.isFeatured, is_published: true };
      return modal?.id ? base44.entities.GalleryItem.update(modal.id, payload) : base44.entities.GalleryItem.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries(["gallery-items-admin"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.GalleryItem.delete(id),
    onSuccess: () => qc.invalidateQueries(["gallery-items-admin"]),
  });

  const openCreate = () => { setForm({ imageUrl: "", categoryId: "", caption: "", eventDate: "", tags: [], sortOrder: items.length, isFeatured: false }); setModal({}); };
  const openEdit = (item) => {
    setForm({ imageUrl: item.image_url || "", categoryId: item.category_id || "", caption: item.caption || "", eventDate: item.event_date || "", tags: item.tags || [], sortOrder: item.sort_order || 0, isFeatured: item.is_featured || false });
    setModal(item);
  };

  const upload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, imageUrl: file_url }));
    setUploading(false);
  };

  const bulkUpload = async (files) => {
    setBulkUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.GalleryItem.create({ image_url: file_url, category_id: filterCat !== "all" ? filterCat : null, is_published: true });
    }
    await qc.invalidateQueries(["gallery-items-admin"]);
    setBulkUploading(false);
  };

  const filtered = filterCat === "all" ? items : items.filter(i => i.category_id === filterCat);
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCat === "all" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}>All ({items.length})</button>
          {cats.map(c => <button key={c.id} onClick={() => setFilterCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCat === c.id ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "bg-gray-100 text-gray-600"}`}>{c.name} ({items.filter(i => i.category_id === c.id).length})</button>)}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-orange-400 text-orange-600 hover:bg-orange-50 text-xs font-medium transition-colors">
              {bulkUploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Bulk Upload</>}
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files?.length && bulkUpload(Array.from(e.target.files))} disabled={bulkUploading} />
          </label>
          <Button size="sm" onClick={openCreate} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0"><Plus className="w-4 h-4 mr-1" />Add Photo</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-200" /><p>No photos yet</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              <img src={item.image_url} alt={item.caption} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(item)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteMut.mutate(item.id)} className="p-1.5 rounded-full bg-white/20 hover:bg-red-500 text-white"><Trash2 className="w-4 h-4" /></button>
              </div>
              {item.is_featured && <div className="absolute top-2 left-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-300" /></div>}
              {catMap[item.category_id] && <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent"><p className="text-white text-[10px] truncate">{catMap[item.category_id].name}</p></div>}
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <Modal title={modal?.id ? "Edit Photo" : "Add Photo"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Image</label>
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-lg mb-2" />}
              <div className="flex gap-2">
                <Input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." className="flex-1" />
                <label className="cursor-pointer flex-shrink-0"><div className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm">{uploading ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}</div><input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
              <Select value={form.categoryId || "none"} onValueChange={v => setForm(p => ({ ...p, categoryId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {cats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Caption</label>
                <Input value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Event Date</label>
                <Input type="date" value={form.eventDate} onChange={e => setForm(p => ({ ...p, eventDate: e.target.value }))} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />Featured photo</label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0">
                {saveMut.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-1" />Save</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AdminCMSGallery() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
        <p className="text-gray-500 text-sm mt-1">Manage photo categories and images for the public gallery.</p>
      </div>
      <Tabs defaultValue="items">
        <TabsList className="mb-6">
          <TabsTrigger value="items">Photos</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="items"><ItemsTab /></TabsContent>
        <TabsContent value="categories"><CategoriesTab /></TabsContent>
      </Tabs>
    </div>
  );
}