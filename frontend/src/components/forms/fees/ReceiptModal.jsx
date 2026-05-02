import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { useBranding } from "../hooks/useBranding";
import { useSiteSettings } from "../hooks/useSiteSettings";

export default function ReceiptModal({ open, onClose, payment, invoice, student, term }) {
  const printRef = useRef();
  const { documentLogoUrl, schoolName } = useBranding();
  const { settings } = useSiteSettings();

  const handlePrint = () => {
    const logoHtml = documentLogoUrl
      ? `<div style="text-align:center;margin-bottom:12px;">
           <img src="${documentLogoUrl}" alt="Logo" style="height:120px;width:auto;object-fit:contain;display:inline-block;" />
         </div>`
      : "";
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
        .header { text-align: center; border-bottom: 2px solid ${settings?.primaryColor || "#f97316"}; padding-bottom: 16px; margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        .label { color: #6b7280; } .value { font-weight: 600; }
        .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: bold; }
        .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .items-table th { background: color-mix(in srgb, ${settings?.primaryColor || "#f97316"} 10%, white); padding: 8px; text-align: left; font-size: 12px; }
        .items-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .stamp { text-align: center; margin-top: 32px; color: #16a34a; font-size: 18px; font-weight: bold; border: 3px solid #16a34a; display: inline-block; padding: 8px 24px; border-radius: 8px; transform: rotate(-5deg); }
        @media print { button { display: none; } }
      </style></head><body>${logoHtml}${content}</body></html>`);
    win.document.close();
    win.print();
  };

  if (!payment || !invoice || !student) return null;

  const date = payment.date ? format(new Date(payment.date), "dd MMM yyyy") : "—";

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        <div ref={printRef}>
          <div className="header border-b-2 pb-4 mb-4 text-center" style={{ borderColor: "var(--brand-primary)" }}>
            {documentLogoUrl && (
              <img
                src={documentLogoUrl}
                alt={schoolName}
                className="mx-auto mb-3 object-contain"
                style={{ height: "120px", width: "auto" }}
              />
            )}
            <h2 className="text-xl font-bold" style={{ color: "var(--brand-primary)" }}>{documentLogoUrl ? "" : "🏫 "}School Fee Receipt</h2>
            <p className="text-sm text-gray-500 mt-1">Official Payment Receipt</p>
          </div>

          <div className="space-y-2 mb-4">
            {[
              { label: "Receipt No.", value: payment.receipt_number || payment.id?.slice(-8).toUpperCase() },
              { label: "Student", value: `${student.first_name} ${student.last_name}` },
              { label: "Admission No.", value: student.admission_no || "—" },
              { label: "Term", value: term?.name || "—" },
              { label: "Payment Date", value: date },
              { label: "Method", value: payment.method?.replace("_", " ").toUpperCase() },
              { label: "Reference", value: payment.reference || "—" },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-semibold text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>

          {invoice.items?.length > 0 && (
            <table className="w-full text-sm mb-4">
              <thead style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 8%, white)" }}>
                <tr><th className="text-left p-2 text-xs text-gray-600">Fee Item</th><th className="text-right p-2 text-xs text-gray-600">Amount</th></tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-right">₦{(item.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="space-y-1 text-sm border-t border-gray-200 pt-3">
            {invoice.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-₦{invoice.discount.toLocaleString()}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
              <span>Amount Paid</span>
              <span style={{ color: "var(--brand-primary)" }}>₦{(payment.amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Balance Remaining</span>
              <span className={invoice.balance > 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                ₦{(invoice.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {invoice.status === "paid" && (
            <div className="mt-4 text-center">
              <span className="inline-block text-green-600 font-bold text-lg border-2 border-green-500 px-6 py-1 rounded-lg" style={{ transform: "rotate(-3deg)", display: "inline-block" }}>
                ✓ FULLY PAID
              </span>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-4">Generated {format(new Date(), "dd MMM yyyy, HH:mm")}</p>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint} style={{ background: "linear-gradient(to right, var(--brand-primary), var(--brand-secondary))" }} className="gap-2 border-0 text-white">
            <Printer className="w-4 h-4" /> Print / Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}