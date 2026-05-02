import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

const TODAY = new Date().toISOString().split("T")[0];

function genReceiptNo() {
  return "RCP" + Date.now().toString().slice(-8);
}

export default function OfflinePaymentDialog({ open, onClose, invoice, currentUser, onSuccess }) {
  const [amount, setAmount] = useState(invoice?.balance || "");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(TODAY);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!amount) return;
    setUploading(true);
    try {
      let proofUrl = "";
      if (proofFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile });
        proofUrl = file_url;
      }
      await base44.entities.Payment.create({
        receipt_number: genReceiptNo(),
        invoice_id: invoice.id,
        student_id: invoice.student_id,
        amount: Number(amount),
        method: "offline_cash",
        reference,
        proof_url: proofUrl,
        date,
        notes,
        received_by: currentUser?.email,
        status: "pending_verification",
      });
      setSubmitted(true);
      onSuccess?.();
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mt-4" />
          <h3 className="text-lg font-bold text-gray-900 mt-2">Payment Submitted!</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Your payment proof has been submitted and is awaiting admin verification. You'll be notified once it's confirmed.
          </p>
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white rounded-xl">Done</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Offline / Cash Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <p className="font-semibold mb-0.5">📋 How it works</p>
            <p className="text-xs leading-relaxed">Pay via cash or bank transfer, then upload your receipt or teller here. The school admin will verify and confirm your payment.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Amount Paid (₦) *</label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="rounded-xl"
                placeholder={`Balance: ₦${(invoice?.balance || 0).toLocaleString()}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Payment Date</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Bank / Teller Reference</label>
            <Input
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="rounded-xl"
              placeholder="e.g. bank teller no., transfer reference..."
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Upload Payment Proof *</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500">
                {proofFile ? proofFile.name : "Click to upload receipt / teller / screenshot"}
              </span>
              <span className="text-xs text-gray-400">JPG, PNG or PDF</span>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => setProofFile(e.target.files[0])} />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Additional Notes</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any extra information for the admin..."
              className="text-sm resize-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button
              disabled={!amount || !proofFile || uploading}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white rounded-xl gap-2"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Submit for Verification"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}