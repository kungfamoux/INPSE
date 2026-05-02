import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DataTable from "../components/portal/DataTable";
import { Plus, BookOpen } from "lucide-react";

const levelLabels = { nursery: "Nursery", primary: "Primary", junior_secondary: "Junior Sec.", senior_secondary: "Senior Sec.", all: "All Levels" };

export default function AdminSubjects() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", level: "all" });

  const qc = useQueryClient();
  const { data: subjects = [], isLoading } = useQuery({ queryKey: ["subjects"], queryFn: () => base44.entities.Subject.list() });

  const createMut = useMutation({ mutationFn: d => base44.entities.Subject.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); close(); } });
  const updateMut = useMutation({ mutationFn: ({ id, data }) => base44.entities.Subject.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); close(); } });
  const deleteMut = useMutation({ mutationFn: id => base44.entities.Subject.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }) });

  const openCreate = () => { setEditItem(null); setForm({ name: "", code: "", level: "all" }); setShowForm(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, code: s.code || "", level: s.level || "all" }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditItem(null); };

  const handleSubmit = (e) => { e.preventDefault(); editItem ? updateMut.mutate({ id: editItem.id, data: form }) : createMut.mutate(form); };

  const columns = [
    { key: "name", label: "Subject", render: r => <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange-400" /><span className="font-medium">{r.name}</span></div> },
    { key: "code", label: "Code", render: r => r.code || "—" },
    { key: "level", label: "Level", render: r => <Badge className="text-xs bg-gray-100 text-gray-600">{levelLabels[r.level] || r.level}</Badge> },
    { key: "actions", label: "Actions", render: r => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg text-red-500" onClick={(e) => { e.stopPropagation(); if(confirm("Delete?")) deleteMut.mutate(r.id); }}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{subjects.length} subjects</p>
        <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500"><Plus className="w-4 h-4 mr-2" /> Add Subject</Button>
      </div>
      <DataTable columns={columns} data={subjects} isLoading={isLoading} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Subject" : "Add Subject"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name *</label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Mathematics" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Code</label><Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. MTH" /></div>
              <div><label className="text-sm font-medium mb-1 block">Level</label>
                <Select value={form.level} onValueChange={v => setForm({...form, level: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(levelLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editItem ? "Update" : "Create"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}