import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, Info, CheckCircle, AlertTriangle, AlertOctagon, Users, User, School } from "lucide-react";
import { format } from "date-fns";

const TYPE_CONFIG = {
  info:    { icon: Info,          cls: "bg-blue-100 text-blue-700",   label: "Info" },
  success: { icon: CheckCircle,   cls: "bg-green-100 text-green-700", label: "Success" },
  warning: { icon: AlertTriangle, cls: "bg-yellow-100 text-yellow-700", label: "Warning" },
  urgent:  { icon: AlertOctagon,  cls: "bg-red-100 text-red-700",     label: "Urgent" },
};

const EMPTY = { title: "", message: "", type: "info", link: "", user_email: "", role: "", class_id: "", expires_at: "" };

export default function AdminNotifications({ currentUser }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [targetMode, setTargetMode] = useState("broadcast"); // broadcast | role | user | class

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["all-notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 200),
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => base44.entities.SchoolClass.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => { qc.invalidateQueries(["all-notifications"]); setShowForm(false); setForm(EMPTY); setTargetMode("broadcast"); },
  });
  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => qc.invalidateQueries(["all-notifications"]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (targetMode !== "user")  payload.user_email = "";
    if (targetMode !== "role")  payload.role = "";
    if (targetMode !== "class") payload.class_id = "";
    createMut.mutate(payload);
  };

  const targetIcon = (n) => {
    if (n.user_email) return <span className="flex items-center gap-1 text-xs text-gray-500"><User className="w-3 h-3" />{n.user_email}</span>;
    if (n.role)       return <span className="flex items-center gap-1 text-xs text-gray-500"><Users className="w-3 h-3" /> Role: {n.role}</span>;
    if (n.class_id)   return <span className="flex items-center gap-1 text-xs text-gray-500"><School className="w-3 h-3" /> Class</span>;
    return <span className="text-xs text-gray-400">Broadcast</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 text-sm mt-0.5">Send and manage portal notifications</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2">
          <Plus className="w-4 h-4" /> New Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
          const Icon = cfg.icon;
          const count = notifications.filter(n => n.type === type).length;
          return (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.cls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Notification</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Target</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Sent</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? Array(4).fill(0).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <tr key={n.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{n.message}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge className={`text-xs gap-1 inline-flex items-center ${cfg.cls}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">{targetIcon(n)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                    {n.created_date ? format(new Date(n.created_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-7 w-7 p-0"
                      onClick={() => { if (confirm("Delete?")) deleteMut.mutate(n.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!isLoading && notifications.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No notifications yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" /> Send Notification
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Title *</label>
              <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notification title" className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Message *</label>
              <Textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Notification body..." className="rounded-xl" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Link (optional)</label>
                <Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." className="rounded-xl" />
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Target Audience</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {["broadcast","role","user","class"].map(m => (
                  <button key={m} type="button" onClick={() => setTargetMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${targetMode === m ? "bg-orange-500 text-white border-orange-500" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              {targetMode === "role" && (
                <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {["admin","teacher","parent","student","accountant","store_manager"].map(r => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace("_"," ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {targetMode === "user" && (
                <Input value={form.user_email} onChange={e => setForm({ ...form, user_email: e.target.value })} placeholder="user@email.com" className="rounded-xl" />
              )}
              {targetMode === "class" && (
                <Select value={form.class_id} onValueChange={v => setForm({ ...form, class_id: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Expires At (optional)</label>
              <Input type="datetime-local" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="rounded-xl" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending} className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                Send Notification
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}