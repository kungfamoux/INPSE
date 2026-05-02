import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

function empty() { return { name: "", slug: "", description: "", icon: "", sort_order: 0, is_active: true }; }

export default function AdminStoreCategories() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());

  const { data: categories = [], isLoading } = useQuery({ queryKey: ["store-categories"], queryFn: () => base44.entities.StoreCategory.list("sort_order") });
  const { data: products = [] } = useQuery({ queryKey: ["store-products"], queryFn: () => base44.entities.StoreProduct.list() });

  const save = useMutation({
    mutationFn: d => editing ? base44.entities.StoreCategory.update(editing.id, d) : base44.entities.StoreCategory.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["store-categories"] }); setShowForm(false); setEditing(null); setForm(empty()); },
  });
  const del = useMutation({
    mutationFn: id => base44.entities.StoreCategory.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-categories"] }),
  });

  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setShowForm(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Store Categories</h2>
        <Button onClick={() => { setEditing(null); setForm(empty()); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Add Category
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />) :
          categories.map(cat => {
            const count = products.filter(p => p.category_id === cat.id).length;
            return (
              <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {cat.icon || <Tag className="w-5 h-5 text-orange-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">{count} products · Order: {cat.sort_order}</p>
                  {!cat.is_active && <p className="text-xs text-red-500">Inactive</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(cat)}><Pencil className="w-4 h-4 text-gray-400" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(cat.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </div>
            );
          })
        }
      </div>

      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs mb-1 block">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} className="rounded-xl" /></div>
            <div><Label className="text-xs mb-1 block">Description</Label><Input value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Icon (emoji)</Label><Input value={form.icon || ""} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="rounded-xl" placeholder="🎽" /></div>
              <div><Label className="text-xs mb-1 block">Sort Order</Label><Input type="number" value={form.sort_order || 0} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="rounded-xl" /></div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => save.mutate(form)} disabled={save.isPending} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">{save.isPending ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}