import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package, ChevronDown, ChevronUp } from "lucide-react";

function empty() {
  return { name: "", slug: "", description: "", category_id: "", price: "", sale_price: "", sku: "", is_active: true, is_featured: false, images: [] };
}
function emptyVariant(productId) {
  return { product_id: productId, variant_name: "", option: "", sku: "", stock_qty: 0, extra_price: 0, is_active: true };
}

export default function AdminStoreProducts() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [variantForm, setVariantForm] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ["store-categories"], queryFn: () => base44.entities.StoreCategory.list("sort_order") });
  const { data: products = [], isLoading } = useQuery({ queryKey: ["store-products"], queryFn: () => base44.entities.StoreProduct.list("sort_order") });
  const { data: variants = [] } = useQuery({ queryKey: ["store-variants"], queryFn: () => base44.entities.StoreVariant.list() });

  const saveProduct = useMutation({
    mutationFn: d => editing ? base44.entities.StoreProduct.update(editing.id, d) : base44.entities.StoreProduct.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["store-products"] }); setShowForm(false); setEditing(null); setForm(empty()); },
  });
  const deleteProduct = useMutation({
    mutationFn: id => base44.entities.StoreProduct.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-products"] }),
  });
  const saveVariant = useMutation({
    mutationFn: d => d.id ? base44.entities.StoreVariant.update(d.id, d) : base44.entities.StoreVariant.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["store-variants"] }); setVariantForm(null); },
  });
  const deleteVariant = useMutation({
    mutationFn: id => base44.entities.StoreVariant.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-variants"] }),
  });

  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setShowForm(true); };
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    const res = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, images: [...(f.images || []), res.file_url] }));
    setUploadingImg(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Store Products</h2>
        <Button onClick={() => { setEditing(null); setForm(empty()); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center"><Package className="w-12 h-12 mx-auto mb-3 text-gray-200" /><p className="text-gray-400">No products yet.</p></div>
      ) : (
        products.map(p => {
          const pVariants = variants.filter(v => v.product_id === p.id);
          const expanded = expandedProduct === p.id;
          return (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" /> : <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-gray-300" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                    {!p.is_active && <Badge className="bg-red-100 text-red-600 text-xs">Inactive</Badge>}
                    {p.is_featured && <Badge className="bg-orange-100 text-orange-600 text-xs">Featured</Badge>}
                  </div>
                  <p className="text-xs text-gray-400">{catMap[p.category_id] || "No category"} · SKU: {p.sku || "—"}</p>
                  <p className="text-sm font-bold text-orange-600 mt-0.5">₦{p.sale_price ? p.sale_price.toLocaleString() : p.price?.toLocaleString()} {p.sale_price && <span className="text-gray-400 line-through text-xs font-normal ml-1">₦{p.price?.toLocaleString()}</span>}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{pVariants.length} variants</Badge>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4 text-gray-400" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteProduct.mutate(p.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setExpandedProduct(expanded ? null : p.id)}>
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="border-t bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">Variants</p>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setVariantForm(emptyVariant(p.id))}>
                      <Plus className="w-3 h-3 mr-1" /> Add Variant
                    </Button>
                  </div>
                  {pVariants.length === 0 ? <p className="text-xs text-gray-400">No variants added.</p> : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {pVariants.map(v => (
                        <div key={v.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold">{v.variant_name}: {v.option}</p>
                            <p className="text-xs text-gray-400">SKU: {v.sku || "—"} · Stock: {v.stock_qty} {v.extra_price > 0 && `· +₦${v.extra_price}`}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setVariantForm({ ...v })}><Pencil className="w-3 h-3 text-gray-400" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteVariant.mutate(v.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs mb-1 block">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} className="rounded-xl" /></div>
            <div><Label className="text-xs mb-1 block">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Price (₦) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || "" }))} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1 block">Sale Price (₦)</Label><Input type="number" value={form.sale_price || ""} onChange={e => setForm(f => ({ ...f, sale_price: parseFloat(e.target.value) || null }))} className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">SKU</Label><Input value={form.sku || ""} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1 block">Category</Label>
                <Select value={form.category_id || ""} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured</label>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Product Images</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="rounded-xl" />
              {uploadingImg && <p className="text-xs text-orange-500 mt-1">Uploading...</p>}
              <div className="flex gap-2 mt-2 flex-wrap">
                {(form.images || []).map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, n) => n !== i) }))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => saveProduct.mutate(form)} disabled={saveProduct.isPending} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">{saveProduct.isPending ? "Saving..." : "Save Product"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variant Form Dialog */}
      {variantForm && (
        <Dialog open={!!variantForm} onOpenChange={() => setVariantForm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{variantForm.id ? "Edit Variant" : "Add Variant"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs mb-1 block">Variant Name (e.g. Size, Color)</Label><Input value={variantForm.variant_name} onChange={e => setVariantForm(f => ({ ...f, variant_name: e.target.value }))} className="rounded-xl" /></div>
              <div><Label className="text-xs mb-1 block">Option (e.g. 8yrs, Red)</Label><Input value={variantForm.option} onChange={e => setVariantForm(f => ({ ...f, option: e.target.value }))} className="rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs mb-1 block">Stock Qty</Label><Input type="number" value={variantForm.stock_qty} onChange={e => setVariantForm(f => ({ ...f, stock_qty: parseInt(e.target.value) || 0 }))} className="rounded-xl" /></div>
                <div><Label className="text-xs mb-1 block">Extra Price (₦)</Label><Input type="number" value={variantForm.extra_price || 0} onChange={e => setVariantForm(f => ({ ...f, extra_price: parseFloat(e.target.value) || 0 }))} className="rounded-xl" /></div>
              </div>
              <div><Label className="text-xs mb-1 block">SKU</Label><Input value={variantForm.sku || ""} onChange={e => setVariantForm(f => ({ ...f, sku: e.target.value }))} className="rounded-xl" /></div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setVariantForm(null)}>Cancel</Button>
                <Button onClick={() => saveVariant.mutate(variantForm)} disabled={saveVariant.isPending} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">{saveVariant.isPending ? "Saving..." : "Save"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}