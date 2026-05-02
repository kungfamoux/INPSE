import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { logAudit } from "../utils/auditLogger";

export default function AdminAnnouncements({ currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", audience: "all", priority: "normal" });

  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({ queryKey: ["announcements"], queryFn: () => base44.entities.Announcement.list("-created_date", 100) });

  const createMut = useMutation({
    mutationFn: d => base44.entities.Announcement.create(d),
    onSuccess: (created, data) => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      logAudit(currentUser, { action: "CREATE_ANNOUNCEMENT", module: "Announcements", entity_type: "Announcement", entity_id: created.id, summary: `Published announcement: "${data.title}" to ${data.audience}`, new_values: { title: data.title, audience: data.audience, priority: data.priority } });
      close();
    }
  });
  const updateMut = useMutation({
    mutationFn: ({id, data}) => base44.entities.Announcement.update(id, data),
    onSuccess: (_, { id, data, oldData }) => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      logAudit(currentUser, { action: "UPDATE_ANNOUNCEMENT", module: "Announcements", entity_type: "Announcement", entity_id: id, summary: `Updated announcement: "${data.title}"`, old_values: oldData ? { title: oldData.title, audience: oldData.audience, priority: oldData.priority } : null, new_values: { title: data.title, audience: data.audience, priority: data.priority } });
      close();
    }
  });
  const deleteMut = useMutation({
    mutationFn: ({ id }) => base44.entities.Announcement.delete(id),
    onSuccess: (_, { id, record }) => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      logAudit(currentUser, { action: "DELETE_ANNOUNCEMENT", module: "Announcements", entity_type: "Announcement", entity_id: id, summary: `Deleted announcement: "${record?.title}"`, old_values: record ? { title: record.title, audience: record.audience } : null });
    }
  });

  const open = (item) => { setEditItem(item); setForm(item ? { title: item.title, body: item.body, audience: item.audience, priority: item.priority } : { title: "", body: "", audience: "all", priority: "normal" }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditItem(null); };

  const columns = [
    { key: "title", label: "Title", render: r => <span className="font-medium">{r.title}</span> },
    { key: "audience", label: "Audience", render: r => <Badge className="text-xs bg-blue-100 text-blue-700 capitalize">{r.audience}</Badge> },
    { key: "priority", label: "Priority", render: r => <Badge className={`text-xs ${r.priority === "urgent" ? "bg-red-100 text-red-700" : r.priority === "important" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{r.priority}</Badge> },
    { key: "created_date", label: "Date", render: r => r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—" },
    { key: "actions", label: "", render: r => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg" onClick={e => { e.stopPropagation(); open(r); }}>Edit</Button>
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg text-red-500" onClick={e => { e.stopPropagation(); if(confirm("Delete?")) deleteMut.mutate({ id: r.id, record: r }); }}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => open(null)} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500"><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
      </div>
      <DataTable columns={columns} data={items} isLoading={isLoading} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Announcement" : "New Announcement"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); editItem ? updateMut.mutate({ id: editItem.id, data: form, oldData: editItem }) : createMut.mutate(form); }} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title *</label><Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><label className="text-sm font-medium mb-1 block">Message *</label><Textarea required value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="h-24" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Audience</label>
                <Select value={form.audience} onValueChange={v => setForm({...form, audience: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="all">Everyone</SelectItem><SelectItem value="students">Students</SelectItem><SelectItem value="parents">Parents</SelectItem><SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent></Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="normal">Normal</SelectItem><SelectItem value="important">Important</SelectItem><SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editItem ? "Update" : "Publish"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}