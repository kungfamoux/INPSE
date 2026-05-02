import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Star, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdminSessions() {
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showTermForm, setShowTermForm] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [editTerm, setEditTerm] = useState(null);
  const [sessionForm, setSessionForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  const [termForm, setTermForm] = useState({ session_id: "", name: "", start_date: "", end_date: "", is_current: false });

  const qc = useQueryClient();
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => base44.entities.AcademicSession.list("-created_date") });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list("-created_date") });

  const createSession = useMutation({ mutationFn: d => base44.entities.AcademicSession.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions"] }); setShowSessionForm(false); } });
  const updateSession = useMutation({ mutationFn: ({id, data}) => base44.entities.AcademicSession.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions"] }); setShowSessionForm(false); } });
  const deleteSession = useMutation({ mutationFn: id => base44.entities.AcademicSession.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }) });

  const createTerm = useMutation({ mutationFn: d => base44.entities.Term.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["terms"] }); setShowTermForm(false); } });
  const updateTerm = useMutation({ mutationFn: ({id, data}) => base44.entities.Term.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["terms"] }); setShowTermForm(false); } });
  const deleteTerm = useMutation({ mutationFn: id => base44.entities.Term.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["terms"] }) });

  return (
    <div className="space-y-8">
      {/* Sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Academic Sessions</h3>
          <Button onClick={() => { setEditSession(null); setSessionForm({ name: "", start_date: "", end_date: "", is_current: false }); setShowSessionForm(true); }} className="rounded-xl bg-gradient-to-r from-orange-500 to-pink-500" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Session
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(s => (
            <div key={s.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${s.is_current ? "border-orange-400" : "border-transparent"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-900">{s.name}</span>
                  {s.is_current && <Badge className="bg-orange-100 text-orange-700 text-xs">Current</Badge>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditSession(s); setSessionForm({ name: s.name, start_date: s.start_date || "", end_date: s.end_date || "", is_current: s.is_current }); setShowSessionForm(true); }} className="p-1 hover:bg-gray-100 rounded"><Pencil className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={() => { if(confirm("Delete?")) deleteSession.mutate(s.id) }} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
              <div className="text-xs text-gray-400">{s.start_date || "No dates"} — {s.end_date || ""}</div>
              {/* Terms under this session */}
              <div className="mt-3 space-y-1.5">
                {terms.filter(t => t.session_id === s.id).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.name}</span>
                      {t.is_current && <span className="w-2 h-2 rounded-full bg-green-500" />}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditTerm(t); setTermForm({ session_id: t.session_id, name: t.name, start_date: t.start_date || "", end_date: t.end_date || "", is_current: t.is_current }); setShowTermForm(true); }} className="p-0.5 hover:bg-gray-200 rounded"><Pencil className="w-3 h-3 text-gray-400" /></button>
                      <button onClick={() => { if(confirm("Delete?")) deleteTerm.mutate(t.id) }} className="p-0.5 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setEditTerm(null); setTermForm({ session_id: s.id, name: "First Term", start_date: "", end_date: "", is_current: false }); setShowTermForm(true); }} className="text-xs text-orange-500 font-medium hover:underline">+ Add Term</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Form */}
      <Dialog open={showSessionForm} onOpenChange={setShowSessionForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSession ? "Edit Session" : "Add Session"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); editSession ? updateSession.mutate({ id: editSession.id, data: sessionForm }) : createSession.mutate(sessionForm); }} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name *</label><Input required value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} placeholder="e.g. 2025/2026" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Start Date</label><Input type="date" value={sessionForm.start_date} onChange={e => setSessionForm({...sessionForm, start_date: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">End Date</label><Input type="date" value={sessionForm.end_date} onChange={e => setSessionForm({...sessionForm, end_date: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={sessionForm.is_current} onCheckedChange={v => setSessionForm({...sessionForm, is_current: v})} />
              <label className="text-sm font-medium">Set as current session</label>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setShowSessionForm(false)}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editSession ? "Update" : "Create"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Term Form */}
      <Dialog open={showTermForm} onOpenChange={setShowTermForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editTerm ? "Edit Term" : "Add Term"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); editTerm ? updateTerm.mutate({ id: editTerm.id, data: termForm }) : createTerm.mutate(termForm); }} className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Term *</label>
              <Select value={termForm.name} onValueChange={v => setTermForm({...termForm, name: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="First Term">First Term</SelectItem><SelectItem value="Second Term">Second Term</SelectItem><SelectItem value="Third Term">Third Term</SelectItem></SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Start Date</label><Input type="date" value={termForm.start_date} onChange={e => setTermForm({...termForm, start_date: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1 block">End Date</label><Input type="date" value={termForm.end_date} onChange={e => setTermForm({...termForm, end_date: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={termForm.is_current} onCheckedChange={v => setTermForm({...termForm, is_current: v})} />
              <label className="text-sm font-medium">Set as current term</label>
            </div>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setShowTermForm(false)}>Cancel</Button><Button type="submit" className="bg-gradient-to-r from-orange-500 to-pink-500">{editTerm ? "Update" : "Create"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}