import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

function empty() { return { code: "", type: "percent", value: "", usage_limit: "", expiry_date: "", is_active: true }; }

export default function AdminStoreCoupons() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());

  const { data: coupons = [], isLoading } = useQuery({ queryKey: ["store-coupons"], queryFn: () => base44.entities.StoreCoupon.list("-created_date") });

  const save = useMutation({
    mutationFn: d => editing ? base44.entities.StoreCoupon.update(editing.id, d) : base44.entities.StoreCoupon.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["store-coupons"] }); setShowForm(false); setEditing(null); setForm(empty()); },
  });
  const del = useMutation({
    mutationFn: id => base44.entities.StoreCoupon.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store-coupons"] }),
  });

  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setShowForm(true); };
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Coupons</h2>
        <Button onClick={() => { setEditing(null); setForm(empty()); setShowForm(true); }} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Add Coupon
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? [1,2].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />) :
          coupons.map(c => {
            const expired = c.expiry_date && c.expiry_date < today;
            return (
              <div key={c.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${!c.is_active || expired ? "border-gray-100 opacity-60" : "border-orange-100"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-gray-900 font-mono">{c.code}</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-600 mt-1">
                      {c.type === "percent" ? `${c.value}% OFF` : `₦${c.value?.toLocaleString()} OFF`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Used: {c.usage_count || 0}/{c.usage_limit || "∞"} · Expires: {c.expiry_date || "Never"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className={expired ? "bg-red-100 text-red-600 text-xs" : c.is_active ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                      {expired ? "Expired" : c.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1 mt-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}><Pencil className="w-3 h-3 text-gray-400" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del.mutate(c.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Edit Coupon" : "Add Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs mb-1 block">Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="rounded-xl font-mono" placeholder="SAVE20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percent">Percent (%)</SelectItem><SelectItem value="fixed">Fixed (₦)</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs mb-1 block">Value *</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || "" }))} className="rounded-xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Usage Limit</Label><Input type="number" value={form.usage_limit || ""} onChange={e => setForm(f => ({ ...f, usage_limit: parseInt(e.target.value) || null }))} className="rounded-xl" placeholder="Unlimited" /></div>
              <div><Label className="text-xs mb-1 block">Expiry Date</Label><Input type="date" value={form.expiry_date || ""} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="rounded-xl" /></div>
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