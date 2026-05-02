import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { logAudit } from "../utils/auditLogger";

export default function AdminStaff({ currentUser }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", role: "teacher", qualification: "", status: "active" });

  const qc = useQueryClient();
  const { data: staff = [], isLoading } = useQuery({ queryKey: ["staff"], queryFn: () => base44.entities.Staff.list("-created_date", 500) });

  const createMut = useMutation({
    mutationFn: d => base44.entities.Staff.create(d),
    onSuccess: (created, data) => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      logAudit(currentUser, { action: "CREATE_STAFF", module: "Staff", entity_type: "Staff", entity_id: created.id, summary: `Created staff: ${data.first_name} ${data.last_name} (${data.role})`, new_values: { name: `${data.first_name} ${data.last_name}`, role: data.role, email: data.email } });
      close();
    }
  });
  const updateMut = useMutation({
    mutationFn: ({id, data}) => base44.entities.Staff.update(id, data),
    onSuccess: (_, { id, data, oldData }) => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      logAudit(currentUser, { action: "UPDATE_STAFF", module: "Staff", entity_type: "Staff", entity_id: id, summary: `Updated staff: ${data.first_name} ${data.last_name}`, old_values: oldData ? { role: oldData.role, status: oldData.status } : null, new_values: { role: data.role, status: data.status } });
      close();
    }
  });
  const deleteMut = useMutation({
    mutationFn: ({ id }) => base44.entities.Staff.delete(id),
    onSuccess: (_, { id, record }) => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      logAudit(currentUser, { action: "DELETE_STAFF", module: "Staff", entity_type: "Staff", entity_id: id, summary: `Deleted staff: ${record?.first_name} ${record?.last_name}`, old_values: record ? { name: `${record.first_name} ${record.last_name}`, role: record.role } : null });
    }
  });

  const openCreate = () => { setEditItem(null); setForm({ first_name: "", last_name: "", email: "", phone: "", role: "teacher", qualification: "", status: "active" }); setShowForm(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ ...s }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditItem(null); };

  const filtered = staff.filter(s => `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
  const roleColors = { teacher: "bg-blue-100 text-blue-700", admin: "bg-purple-100 text-purple-700", accountant: "bg-green-100 text-green-700", support: "bg-gray-100 text-gray-600" };

  const columns = [
    { key: "name", label: "Name", render: r => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xs">{r.first_name?.[0]}{r.last_name?.[0]}</div><span className="font-medium">{r.first_name} {r.last_name}</span></div> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: r => <Badge className={`text-xs capitalize ${roleColors[r.role] || roleColors.support}`}>{r.role}</Badge> },
    { key: "status", label: "Status", render: r => <Badge className={`text-xs ${r.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{r.status}</Badge> },
    { key: "actions", label: "", render: r => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg" onClick={e => { e.stopPropagation(); openEdit(r); }}>Edit</Button>
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg text-red-500" onClick={e => { e.stopPropagation(); if(confirm("Delete?")) deleteMut.mutate({ id: r.id, record: r }); }}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500"><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Staff" : "Add Staff"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); editItem ? updateMut.mutate({ id: editItem.id, data: form, oldData: editItem }) : createMut.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">First Name *</label><Input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">Last Name *</label><Input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Email *</label><Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">Phone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Role</label>
                <Select value={form.role} onValueChange={v => setForm({...form, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="accountant">Accountant</SelectItem><SelectItem value="support">Support</SelectItem>
                </SelectContent></Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Qualification</label><Input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editItem ? "Update" : "Create"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}