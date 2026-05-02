import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

export default function EditReasonDialog({ open, onClose, onConfirm, studentName, oldStatus, newStatus }) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { onClose(); setReason(""); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Edit Submitted Attendance
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
            Changing <strong>{studentName}</strong>'s status from <strong className="capitalize">{oldStatus}</strong> → <strong className="capitalize">{newStatus}</strong>. This edit will be logged.
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason for edit <span className="text-red-500">*</span></label>
            <Textarea
              placeholder="e.g. Student arrived late with a note, initially marked absent in error..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={!reason.trim()}
              className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
              Save & Log Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}