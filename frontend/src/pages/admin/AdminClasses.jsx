import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, School, Pencil, Trash2 } from "lucide-react";

const levelLabels = { nursery: "Nursery", primary: "Primary", junior_secondary: "Junior Secondary", senior_secondary: "Senior Secondary" };
const levelColors = { nursery: "bg-pink-100 text-pink-700", primary: "bg-blue-100 text-blue-700", junior_secondary: "bg-green-100 text-green-700", senior_secondary: "bg-purple-100 text-purple-700" };

export default function AdminClasses() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", arm: "", level: "", capacity: "" });

  const qc = useQueryClient();
  const { data: classes = [], isLoading } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.filter({ status: "active" }) });

  const createMut = useMutation({ mutationFn: (d) => base44.entities.SchoolClass.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); close(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => base44.entities.SchoolClass.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); close(); } });
  const deleteMut = useMutation({ mutationFn: (id) => base44.entities.SchoolClass.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }) });

  const openCreate = () => { setEditItem(null); setForm({ name: "", arm: "", level: "", capacity: "" }); setShowForm(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, arm: c.arm || "", level: c.level, capacity: c.capacity || "" }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditItem(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const d = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined };
    editItem ? updateMut.mutate({ id: editItem.id, data: d }) : createMut.mutate(d);
  };

  const countStudents = (classId) => students.filter(s => s.class_id === classId).length;

  const grouped = {};
  classes.forEach(c => { const l = c.level || "other"; if (!grouped[l]) grouped[l] = []; grouped[l].push(c); });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{classes.length} classes total</p>
        <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500"><Plus className="w-4 h-4 mr-2" /> Add Class</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        Object.entries(grouped).map(([level, list]) => (
          <div key={level}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{levelLabels[level] || level}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                        <School className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{c.name} {c.arm || ""}</p>
                        <Badge className={`text-xs mt-0.5 ${levelColors[c.level] || "bg-gray-100 text-gray-600"}`}>{levelLabels[c.level]}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                      <button onClick={() => { if(confirm("Delete?")) deleteMut.mutate(c.id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{countStudents(c.id)} students</span>
                    {c.capacity && <span className="text-gray-400">Capacity: {c.capacity}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Class" : "Add Class"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Name *</label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. JSS 1" /></div>
              <div><label className="text-sm font-medium mb-1 block">Arm</label><Input value={form.arm} onChange={e => setForm({...form, arm: e.target.value})} placeholder="e.g. A" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Level *</label>
                <Select value={form.level} onValueChange={v => setForm({...form, level: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{Object.entries(levelLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editItem ? "Update" : "Create"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}