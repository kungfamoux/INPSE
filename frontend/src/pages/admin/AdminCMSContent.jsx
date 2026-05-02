import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, X, Save, Upload } from "lucide-react";
import ReactQuill from "react-quill";
import WhyChooseUsEditor from "../components/cms/WhyChooseUsEditor";
import AboutPageEditor from "../components/cms/AboutPageEditor";

// ─── Generic CRUD Modal ────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Programs ─────────────────────────────────────────────────────
function ProgramsTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", summary: "", description: "", highlights: [], imageUrl: "", sortOrder: 0, isActive: true });
  const [uploading, setUploading] = useState(false);

  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: () => base44.entities.Program.list("sortOrder", 100),
  });

  const saveMut = useMutation({
    mutationFn: (d) => modal?.id ? base44.entities.Program.update(modal.id, d) : base44.entities.Program.create(d),
    onSuccess: () => { qc.invalidateQueries(["programs"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Program.delete(id),
    onSuccess: () => qc.invalidateQueries(["programs"]),
  });

  const openCreate = () => { setForm({ title: "", slug: "", summary: "", description: "", highlights: [], imageUrl: "", sortOrder: programs.length, isActive: true }); setModal({}); };
  const openEdit = (p) => { setForm({ ...p }); setModal(p); };

  const upload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, imageUrl: file_url }));
    setUploading(false);
  };

  const slugify = (s) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{programs.length} program{programs.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openCreate} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0"><Plus className="w-4 h-4 mr-1" />New Program</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map(p => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-36 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.summary}</p>
                </div>
                <Badge className={p.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{p.isActive !== false ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="flex-1"><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(p.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? "Edit Program" : "New Program"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: p.slug || slugify(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Slug</label>
                <Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: slugify(e.target.value) }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Summary (short)</label>
              <Textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} rows={2} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description (rich)</label>
              <ReactQuill value={form.description} onChange={val => setForm(p => ({ ...p, description: val }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Image</label>
              <div className="flex gap-2">
                <Input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." className="flex-1" />
                <label className="cursor-pointer"><div className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-gray-700">{uploading ? <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}</div><input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive !== false} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                Active (show on website)
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
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

// ─── Events ───────────────────────────────────────────────────────
function EventsTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", slug: "", description: "", startDateTime: "", endDateTime: "", location: "", featuredImageUrl: "", status: "draft" });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => base44.entities.Event.list("-startDateTime", 100),
  });

  const saveMut = useMutation({
    mutationFn: (d) => modal?.id ? base44.entities.Event.update(modal.id, d) : base44.entities.Event.create(d),
    onSuccess: () => { qc.invalidateQueries(["events"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Event.delete(id),
    onSuccess: () => qc.invalidateQueries(["events"]),
  });

  const openCreate = () => { setForm({ title: "", slug: "", description: "", startDateTime: "", endDateTime: "", location: "", featuredImageUrl: "", status: "draft" }); setModal({}); };
  const openEdit = (e) => { setForm({ ...e }); setModal(e); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={openCreate} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0"><Plus className="w-4 h-4 mr-1" />New Event</Button>
      </div>
      <div className="space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4 shadow-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">{ev.title}</p>
                <Badge className={ev.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>{ev.status}</Badge>
              </div>
              {ev.startDateTime && <p className="text-xs text-orange-500 mt-0.5">{new Date(ev.startDateTime).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>}
              {ev.location && <p className="text-xs text-gray-400">{ev.location}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => openEdit(ev)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(ev.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? "Edit Event" : "New Event"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Start Date & Time</label>
                <Input type="datetime-local" value={form.startDateTime} onChange={e => setForm(p => ({ ...p, startDateTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">End Date & Time (optional)</label>
                <Input type="datetime-local" value={form.endDateTime} onChange={e => setForm(p => ({ ...p, endDateTime: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="School Hall, Online, etc." />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600 block mb-1">Featured Image URL</label>
                <Input value={form.featuredImageUrl} onChange={e => setForm(p => ({ ...p, featuredImageUrl: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
              <ReactQuill value={form.description} onChange={val => setForm(p => ({ ...p, description: val }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
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

// ─── Policies ─────────────────────────────────────────────────────
function PoliciesTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ type: "privacy", title: "", content: "", status: "draft", lastUpdatedAt: "" });

  const { data: policies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: () => base44.entities.Policy.list("-created_date", 20),
  });

  const saveMut = useMutation({
    mutationFn: (d) => modal?.id ? base44.entities.Policy.update(modal.id, d) : base44.entities.Policy.create(d),
    onSuccess: () => { qc.invalidateQueries(["policies"]); setModal(null); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Policy.delete(id),
    onSuccess: () => qc.invalidateQueries(["policies"]),
  });

  const openCreate = () => { setForm({ type: "privacy", title: "", content: "", status: "draft", lastUpdatedAt: new Date().toISOString().slice(0,10) }); setModal({}); };
  const openEdit = (p) => { setForm({ ...p }); setModal(p); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{policies.length} polic{policies.length !== 1 ? "ies" : "y"}</p>
        <Button size="sm" onClick={openCreate} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0"><Plus className="w-4 h-4 mr-1" />New Policy</Button>
      </div>
      <div className="space-y-3">
        {policies.map(p => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">{p.title}</p>
                <Badge className="bg-blue-100 text-blue-700 text-xs">{p.type}</Badge>
                <Badge className={p.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>{p.status}</Badge>
              </div>
              {p.lastUpdatedAt && <p className="text-xs text-gray-400 mt-0.5">Last updated: {p.lastUpdatedAt}</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate(p.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      {modal !== null && (
        <Modal title={modal?.id ? "Edit Policy" : "New Policy"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["privacy","terms","safeguarding","refund"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Last Updated</label>
                <Input type="date" value={form.lastUpdatedAt} onChange={e => setForm(p => ({ ...p, lastUpdatedAt: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Title</label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Content (rich text)</label>
              <ReactQuill value={form.content} onChange={val => setForm(p => ({ ...p, content: val }))} style={{ height: 280 }} />
              <div className="h-12" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
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

// ─── Main ─────────────────────────────────────────────────────────
export default function AdminCMSContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
        <p className="text-gray-500 text-sm mt-1">Manage programs, events, and school policies.</p>
      </div>
      <Tabs defaultValue="programs">
        <TabsList className="mb-6">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="whychooseus">Why Choose Us</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
        </TabsList>
        <TabsContent value="programs"><ProgramsTab /></TabsContent>
        <TabsContent value="events"><EventsTab /></TabsContent>
        <TabsContent value="policies"><PoliciesTab /></TabsContent>
        <TabsContent value="whychooseus"><WhyChooseUsEditor /></TabsContent>
        <TabsContent value="about"><AboutPageEditor /></TabsContent>
      </Tabs>
    </div>
  );
}