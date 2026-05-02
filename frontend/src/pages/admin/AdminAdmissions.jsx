import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createNotification } from "../components/notifications/useNotifications";
import { logAudit } from "../utils/auditLogger";

import DataTable from "../components/portal/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function AdminAdmissions({ currentUser }) {
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: "", review_notes: "" });

  const qc = useQueryClient();
  const { data: apps = [], isLoading } = useQuery({ queryKey: ["applications"], queryFn: () => base44.entities.AdmissionApplication.list("-created_date", 200) });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AdmissionApplication.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      if (vars.data.status === "accepted") {
        createNotification({ title: "Admission Accepted", message: `Application for ${selected?.student_first_name} ${selected?.student_last_name} has been accepted.`, type: "success", role: "admin" });
      } else if (vars.data.status === "rejected") {
        createNotification({ title: "Admission Rejected", message: `Application for ${selected?.student_first_name} ${selected?.student_last_name} was rejected.`, type: "warning", role: "admin" });
      }
      logAudit(currentUser, { action: "REVIEW_ADMISSION", module: "Admissions", entity_type: "AdmissionApplication", entity_id: vars.id, summary: `Admission ${vars.data.status}: ${selected?.student_first_name} ${selected?.student_last_name}`, old_values: { status: selected?.status }, new_values: { status: vars.data.status, review_notes: vars.data.review_notes } });
      setSelected(null);
    }
  });

  const statusColors = { pending: "bg-yellow-100 text-yellow-700", under_review: "bg-blue-100 text-blue-700", accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

  const columns = [
    { key: "name", label: "Student Name", render: r => <span className="font-medium">{r.student_first_name} {r.student_last_name}</span> },
    { key: "applying_for_class", label: "Class" },
    { key: "parent_name", label: "Parent" },
    { key: "parent_phone", label: "Phone" },
    { key: "created_date", label: "Applied", render: r => r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—" },
    { key: "status", label: "Status", render: r => <Badge className={`text-xs ${statusColors[r.status] || statusColors.pending}`}>{r.status?.replace("_", " ")}</Badge> },
  ];

  const openReview = (app) => {
    setSelected(app);
    setReviewForm({ status: app.status, review_notes: app.review_notes || "" });
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm">{apps.filter(a => a.status === "pending").length} pending applications</p>
      <DataTable columns={columns} data={apps} isLoading={isLoading} onRowClick={openReview} />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Review Application</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400">Student</p><p className="font-medium">{selected.student_first_name} {selected.student_last_name}</p></div>
                <div><p className="text-gray-400">Class</p><p className="font-medium">{selected.applying_for_class}</p></div>
                <div><p className="text-gray-400">DOB</p><p className="font-medium">{selected.date_of_birth}</p></div>
                <div><p className="text-gray-400">Gender</p><p className="font-medium capitalize">{selected.gender}</p></div>
                <div><p className="text-gray-400">Parent</p><p className="font-medium">{selected.parent_name}</p></div>
                <div><p className="text-gray-400">Email</p><p className="font-medium">{selected.parent_email}</p></div>
                <div><p className="text-gray-400">Phone</p><p className="font-medium">{selected.parent_phone}</p></div>
                <div><p className="text-gray-400">Previous School</p><p className="font-medium">{selected.previous_school || "—"}</p></div>
              </div>
              {selected.medical_conditions && <div className="text-sm"><p className="text-gray-400">Medical</p><p>{selected.medical_conditions}</p></div>}

              <div className="border-t pt-4 space-y-3">
                <div><label className="text-sm font-medium mb-1 block">Decision</label>
                  <Select value={reviewForm.status} onValueChange={v => setReviewForm({...reviewForm, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="pending">Pending</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent></Select>
                </div>
                <div><label className="text-sm font-medium mb-1 block">Review Notes</label>
                  <Textarea value={reviewForm.review_notes} onChange={e => setReviewForm({...reviewForm, review_notes: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                  <Button onClick={() => updateMut.mutate({ id: selected.id, data: reviewForm })} className="bg-gradient-to-r from-orange-500 to-pink-500">Save Decision</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}