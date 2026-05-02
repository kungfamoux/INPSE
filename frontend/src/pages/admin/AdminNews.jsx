import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import ReactQuill from "react-quill";

export default function AdminNews() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", excerpt: "", image_url: "", category: "news", is_published: true, published_at: "" });

  const qc = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["news-admin"], queryFn: () => base44.entities.NewsPost.list("-created_date", 100) });

  const createMut = useMutation({ mutationFn: d => base44.entities.NewsPost.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["news-admin"] }); close(); } });
  const updateMut = useMutation({ mutationFn: ({id, data}) => base44.entities.NewsPost.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["news-admin"] }); close(); } });
  const deleteMut = useMutation({ mutationFn: id => base44.entities.NewsPost.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["news-admin"] }) });

  const open = (item) => { setEditItem(item); setForm(item ? { title: item.title, body: item.body, excerpt: item.excerpt || "", image_url: item.image_url || "", category: item.category || "news", is_published: item.is_published !== false, published_at: item.published_at || "" } : { title: "", body: "", excerpt: "", image_url: "", category: "news", is_published: true, published_at: new Date().toISOString().split("T")[0] }); setShowForm(true); };
  const close = () => { setShowForm(false); setEditItem(null); };

  const columns = [
    { key: "title", label: "Title", render: r => <span className="font-medium">{r.title}</span> },
    { key: "category", label: "Category", render: r => <Badge className="text-xs bg-orange-100 text-orange-700 capitalize">{r.category}</Badge> },
    { key: "is_published", label: "Status", render: r => r.is_published ? <Badge className="text-xs bg-green-100 text-green-700">Published</Badge> : <Badge className="text-xs bg-gray-100 text-gray-600">Draft</Badge> },
    { key: "published_at", label: "Date", render: r => r.published_at ? format(new Date(r.published_at), "MMM d, yyyy") : "—" },
    { key: "actions", label: "", render: r => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg" onClick={e => { e.stopPropagation(); open(r); }}>Edit</Button>
        <Button size="sm" variant="outline" className="text-xs h-7 rounded-lg text-red-500" onClick={e => { e.stopPropagation(); if(confirm("Delete?")) deleteMut.mutate(r.id); }}>Delete</Button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => open(null)} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
      </div>
      <DataTable columns={columns} data={posts} isLoading={isLoading} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? "Edit Post" : "New Post"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); editItem ? updateMut.mutate({ id: editItem.id, data: form }) : createMut.mutate(form); }} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title *</label><Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><label className="text-sm font-medium mb-1 block">Excerpt</label><Input value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} placeholder="Short summary..." /></div>
            <div>
              <label className="text-sm font-medium mb-1 block">Body *</label>
              <ReactQuill
                theme="snow"
                value={form.body}
                onChange={v => setForm({...form, body: v})}
                style={{ minHeight: 180 }}
              />
            </div>
            <div><label className="text-sm font-medium mb-1 block">Image URL</label><Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="news">News</SelectItem><SelectItem value="event">Event</SelectItem><SelectItem value="achievement">Achievement</SelectItem><SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent></Select>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Publish Date</label><Input type="date" value={form.published_at} onChange={e => setForm({...form, published_at: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_published} onCheckedChange={v => setForm({...form, is_published: v})} />
              <label className="text-sm font-medium">Published</label>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editItem ? "Update" : "Publish"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}