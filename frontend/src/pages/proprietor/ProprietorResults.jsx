import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Lock, Eye, Clock, AlertTriangle, FileCheck } from "lucide-react";
import { logAudit } from "../utils/auditLogger";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  reviewed: { label: "Reviewed", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", color: "bg-green-100 text-green-700" },
  locked: { label: "Locked", color: "bg-red-100 text-red-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

export default function ProprietorResults({ currentUser }) {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewItem, setViewItem] = useState(null);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["result-approvals"],
    queryFn: () => base44.entities.ResultApproval.list("-created_date", 100),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list("name", 50) });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list("-created_date", 20) });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, extra }) => base44.entities.ResultApproval.update(id, { status, ...extra }),
    onSuccess: (_, { id, status, oldStatus, item }) => {
      qc.invalidateQueries(["result-approvals"]);
      logAudit(currentUser, { action: `${status.toUpperCase()}_RESULTS`, module: "Results", entity_type: "ResultApproval", entity_id: id, summary: `Results ${status}: ${className(item?.class_id)} — ${termName(item?.term_id)}`, old_values: { status: oldStatus }, new_values: { status } });
    },
  });

  const className = (id) => { const c = classes.find(c => c.id === id); return c ? `${c.name} ${c.arm || ""}` : id?.slice(-6); };
  const termName = (id) => { const t = terms.find(t => t.id === id); return t?.name || id?.slice(-6); };

  const filtered = filterStatus === "all" ? approvals : approvals.filter(a => a.status === filterStatus);

  const counts = Object.keys(statusConfig).reduce((acc, k) => ({ ...acc, [k]: approvals.filter(a => a.status === k).length }), {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Results Approval & Lock</h2>
        <p className="text-gray-500 text-sm mt-1">Review, approve and lock results submitted by teachers and admins</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(statusConfig).map(([k, v]) => (
          <div key={k} onClick={() => setFilterStatus(filterStatus === k ? "all" : k)}
            className={`bg-white rounded-xl p-3 border cursor-pointer text-center transition-all ${filterStatus === k ? "border-orange-400 shadow-md" : "border-gray-100 hover:border-orange-200"}`}>
            <p className="text-xl font-bold text-gray-900">{counts[k] || 0}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{v.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-400">{filtered.length} record(s)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Term</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Published</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Submitted By</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-12 m-4 bg-gray-50 rounded animate-pulse" /></td></tr>)
            ) : filtered.map(item => {
              const cfg = statusConfig[item.status] || statusConfig.draft;
              return (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{className(item.class_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{termName(item.term_id)}</td>
                  <td className="px-4 py-3"><Badge className={`${cfg.color} text-xs`}>{cfg.label}</Badge></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {item.is_published ? <Badge className="bg-green-100 text-green-700 text-xs">Published</Badge> : <Badge className="bg-gray-100 text-gray-500 text-xs">Hidden</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{item.submitted_by || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(item)} className="text-xs gap-1 h-7">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {item.status === "reviewed" && (
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: item.id, status: "approved", oldStatus: item.status, item, extra: { approved_by: currentUser?.email, approved_at: new Date().toISOString().split("T")[0] } })}
                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </Button>
                      )}
                      {item.status === "approved" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: item.id, status: "locked", oldStatus: item.status, item, extra: {} })}
                          className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white gap-1">
                          <Lock className="w-3.5 h-3.5" /> Lock
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: item.id, status: "approved", oldStatus: item.status, item, extra: { is_published: !item.is_published } })}
                          className="h-7 text-xs gap-1">
                          {item.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </>
                      )}
                      {item.status === "submitted" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: item.id, status: "reviewed", oldStatus: item.status, item, extra: { reviewed_by: currentUser?.email, reviewed_at: new Date().toISOString().split("T")[0] } })}
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1">
                          <FileCheck className="w-3.5 h-3.5" /> Review
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: item.id, status: "rejected", oldStatus: item.status, item, extra: {} })}
                          className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No result records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Result Approval Details</DialogTitle></DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Class", className(viewItem.class_id)],
                  ["Term", termName(viewItem.term_id)],
                  ["Status", <Badge className={`${statusConfig[viewItem.status]?.color} text-xs`}>{statusConfig[viewItem.status]?.label}</Badge>],
                  ["Published", viewItem.is_published ? "Yes" : "No"],
                  ["Submitted By", viewItem.submitted_by || "—"],
                  ["Submitted At", viewItem.submitted_at || "—"],
                  ["Reviewed By", viewItem.reviewed_by || "—"],
                  ["Approved By", viewItem.approved_by || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400">{k}</p>
                    <p className="font-medium text-gray-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              {viewItem.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-yellow-600 font-medium">Notes</p>
                  <p className="text-sm text-gray-700 mt-1">{viewItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}