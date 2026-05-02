import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Upload, Download } from "lucide-react";
import { logAudit } from "../utils/auditLogger";

export default function AdminStudents({ currentUser }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", admission_no: "", gender: "", date_of_birth: "", class_id: "", status: "active", parent_email: "" });

  const qc = useQueryClient();
  const { data: students = [], isLoading } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.list("-created_date", 500) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create(data),
    onSuccess: (created, data) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      logAudit(currentUser, { action: "CREATE_STUDENT", module: "Students", entity_type: "Student", entity_id: created.id, summary: `Created student: ${data.first_name} ${data.last_name}`, new_values: { name: `${data.first_name} ${data.last_name}`, admission_no: data.admission_no, class_id: data.class_id, status: data.status } });
      closeForm();
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: (_, { id, data, oldData }) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      logAudit(currentUser, { action: "UPDATE_STUDENT", module: "Students", entity_type: "Student", entity_id: id, summary: `Updated student: ${data.first_name} ${data.last_name}`, old_values: oldData ? { name: `${oldData.first_name} ${oldData.last_name}`, status: oldData.status, class_id: oldData.class_id } : null, new_values: { name: `${data.first_name} ${data.last_name}`, status: data.status, class_id: data.class_id } });
      closeForm();
    }
  });
  const deleteMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Student.delete(id),
    onSuccess: (_, { id, record }) => {
      qc.invalidateQueries({ queryKey: ["students"] });
      logAudit(currentUser, { action: "DELETE_STUDENT", module: "Students", entity_type: "Student", entity_id: id, summary: `Deleted student: ${record?.first_name} ${record?.last_name}`, old_values: record ? { name: `${record.first_name} ${record.last_name}`, admission_no: record.admission_no } : null });
    }
  });

  const openCreate = () => { setEditStudent(null); setForm({ first_name: "", last_name: "", admission_no: "", gender: "", date_of_birth: "", class_id: "", status: "active", parent_email: "" }); setShowForm(true); };
  const openEdit = (s) => { setEditStudent(s); setForm({ ...s }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditStudent(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editStudent) updateMutation.mutate({ id: editStudent.id, data: form, oldData: editStudent });
    else createMutation.mutate(form);
  };

  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`]));
  const filtered = students.filter(s => `${s.first_name} ${s.last_name} ${s.admission_no}`.toLowerCase().includes(search.toLowerCase()));

  const statusColors = { active: "bg-green-100 text-green-700", inactive: "bg-gray-100 text-gray-600", graduated: "bg-blue-100 text-blue-700", pending_admission: "bg-yellow-100 text-yellow-700" };

  const columns = [
    { key: "admission_no", label: "Adm. No", render: (r) => <span className="font-medium text-gray-900">{r.admission_no || "—"}</span> },
    { key: "name", label: "Name", render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-bold text-xs">{r.first_name?.[0]}{r.last_name?.[0]}</div>
        <span className="font-medium">{r.first_name} {r.last_name}</span>
      </div>
    )},
    { key: "gender", label: "Gender", render: (r) => <span className="capitalize">{r.gender || "—"}</span> },
    { key: "class_id", label: "Class", render: (r) => classMap[r.class_id] || "—" },
    { key: "status", label: "Status", render: (r) => <Badge className={`text-xs ${statusColors[r.status] || statusColors.active}`}>{r.status?.replace("_", " ")}</Badge> },
    { key: "actions", label: "Actions", render: (r) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="rounded-lg text-xs h-7" onClick={(e) => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="outline" className="rounded-lg text-xs h-7 text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this student?")) deleteMutation.mutate({ id: r.id, record: r }); }}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500">
          <Plus className="w-4 h-4 mr-2" /> Add Student
        </Button>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} />

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editStudent ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">First Name *</label><Input required value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">Last Name *</label><Input required value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Admission No</label><Input value={form.admission_no} onChange={(e) => setForm({...form, admission_no: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">Gender</label>
                <Select value={form.gender} onValueChange={(v) => setForm({...form, gender: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Date of Birth</label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({...form, date_of_birth: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">Class</label>
                <Select value={form.class_id} onValueChange={(v) => setForm({...form, class_id: v})}><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="graduated">Graduated</SelectItem><SelectItem value="pending_admission">Pending</SelectItem></SelectContent></Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Parent Email</label><Input type="email" value={form.parent_email} onChange={(e) => setForm({...form, parent_email: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editStudent ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}