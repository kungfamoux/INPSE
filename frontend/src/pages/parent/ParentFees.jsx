import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import PaymentMethodBadge from "../components/fees/PaymentMethodBadge";
import ReceiptModal from "../components/fees/ReceiptModal";
import { CreditCard, CheckCircle, AlertCircle, Receipt, ChevronDown, ChevronUp, Eye, Wallet } from "lucide-react";
import OfflinePaymentDialog from "../components/fees/OfflinePaymentDialog";

export default function ParentFees({ currentUser }) {
  const [selectedChild, setSelectedChild] = useState("all");
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [offlinePayInvoice, setOfflinePayInvoice] = useState(null);

  const { data: children = [], refetch: refetchChildren } = useQuery({
    queryKey: ["my-children", currentUser?.email],
    queryFn: () => base44.entities.Student.filter({ parent_email: currentUser?.email }),
  });
  const { data: children2 = [] } = useQuery({
    queryKey: ["my-children2", currentUser?.email],
    queryFn: () => base44.entities.Student.filter({ parent_email_2: currentUser?.email }),
  });
  const allChildren = [...children, ...children2].filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

  const { data: invoices = [], isLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => base44.entities.FeeInvoice.list("-created_date", 500),
  });
  const { data: payments = [], refetch: refetchPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500),
  });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });

  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));
  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`.trim()]));

  const childIds = selectedChild === "all" ? allChildren.map(s => s.id) : [selectedChild];
  const myInvoices = invoices.filter(i => childIds.includes(i.student_id)).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const myPayments = payments.filter(p => myInvoices.some(i => i.id === p.invoice_id));

  const totalBilled = myInvoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = myInvoices.reduce((s, i) => s + (i.paid || 0), 0);
  const totalBalance = myInvoices.reduce((s, i) => s + (i.balance || 0), 0);

  const getChildName = (id) => {
    const s = allChildren.find(c => c.id === id);
    return s ? `${s.first_name} ${s.last_name}` : "—";
  };

  const getInvoicePayments = (invoiceId) => myPayments.filter(p => p.invoice_id === invoiceId);

  const statusColor = {
    unpaid: "border-l-4 border-red-400",
    partial: "border-l-4 border-yellow-400",
    paid: "border-l-4 border-green-400",
    overdue: "border-l-4 border-orange-400",
  };

  return (
    <div className="space-y-5">
      {/* Child Selector */}
      {allChildren.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-full sm:w-64 rounded-xl">
              <SelectValue placeholder="All children" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              {allChildren.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">₦{(totalBilled / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-400">Total Billed</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-600">₦{(totalPaid / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-400">Total Paid</p>
        </div>
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center`}>
          <AlertCircle className={`w-6 h-6 mx-auto mb-1 ${totalBalance > 0 ? "text-red-500" : "text-green-500"}`} />
          <p className={`text-xl font-bold ${totalBalance > 0 ? "text-red-600" : "text-green-600"}`}>₦{(totalBalance / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-400">Outstanding</p>
        </div>
      </div>

      {/* Outstanding Alert */}
      {totalBalance > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>⚠ You have outstanding school fees.</strong> Please settle your balance to avoid disruption to your child's education.
        </div>
      )}

      {/* Invoices */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Fee Invoices ({myInvoices.length})</h3>
        {isLoading && Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}
        {!isLoading && myInvoices.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-sm text-gray-400">
            No invoices found for your child(ren).
          </div>
        )}
        {myInvoices.map(inv => {
          const invPayments = getInvoicePayments(inv.id);
          const isExpanded = expandedInvoice === inv.id;
          return (
            <div key={inv.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${statusColor[inv.status] || ""}`}>
              {/* Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{termMap[inv.term_id] || "—"}</p>
                    {allChildren.length > 1 && <span className="text-xs text-gray-400">• {getChildName(inv.student_id)}</span>}
                    <FeeStatusBadge status={inv.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>{classMap[inv.class_id] || "—"}</span>
                    <span>Invoice: <span className="font-mono text-gray-700">{inv.invoice_number || inv.id?.slice(-6)}</span></span>
                    {inv.due_date && <span className={`${new Date(inv.due_date) < new Date() && inv.status !== "paid" ? "text-red-500 font-semibold" : ""}`}>Due: {inv.due_date}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900">₦{(inv.total || 0).toLocaleString()}</p>
                  {inv.balance > 0 && <p className="text-xs text-red-500">₦{inv.balance.toLocaleString()} due</p>}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/30">
                  {/* Fee Items */}
                  {inv.items?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Fee Breakdown</p>
                      <div className="space-y-1">
                        {inv.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-medium">₦{(item.amount || 0).toLocaleString()}</span>
                          </div>
                        ))}
                        {inv.discount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount {inv.discount_reason ? `(${inv.discount_reason})` : ""}</span>
                            <span>-₦{inv.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1 mt-1">
                          <span>Total</span><span>₦{(inv.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {invPayments.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Payment History</p>
                      <div className="space-y-2">
                        {invPayments.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-white rounded-xl p-3 text-sm">
                            <div>
                              <p className="font-semibold text-gray-900">₦{(p.amount || 0).toLocaleString()}</p>
                              <p className="text-xs text-gray-400">{p.date} · <span className="font-mono">{p.receipt_number || p.id?.slice(-6)}</span></p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <PaymentMethodBadge method={p.method} />
                              <FeeStatusBadge status={p.status} />
                              {p.status === "confirmed" && (
                                <button className="text-xs text-orange-600 flex items-center gap-1 hover:underline"
                                  onClick={() => setReceiptData({ payment: p, invoice: inv, student: allChildren.find(s => s.id === inv.student_id), term: terms.find(t => t.id === inv.term_id) })}>
                                  <Receipt className="w-3 h-3" /> Receipt
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pay Offline CTA */}
                  {inv.status !== "paid" && (
                    <div className="bg-orange-50 rounded-xl p-4 text-sm space-y-3">
                      <p className="font-semibold text-orange-700">Make Payment</p>
                      <p className="text-gray-600 text-xs leading-relaxed">
                        Pay via cash or bank transfer, then upload your receipt/teller here for admin verification.
                        Reference invoice number: <strong className="font-mono">{inv.invoice_number}</strong>
                      </p>
                      {/* Check if a pending_verification payment already exists for this invoice */}
                      {myPayments.some(p => p.invoice_id === inv.id && p.status === "pending_verification") ? (
                        <div className="flex items-center gap-2 text-amber-700 bg-amber-100 rounded-lg px-3 py-2 text-xs font-medium">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          Payment proof submitted — awaiting admin verification.
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white rounded-xl"
                          onClick={e => { e.stopPropagation(); setOfflinePayInvoice(inv); }}
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          Submit Payment Proof
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Offline Payment Dialog */}
      {offlinePayInvoice && (
        <OfflinePaymentDialog
          open={!!offlinePayInvoice}
          onClose={() => setOfflinePayInvoice(null)}
          invoice={offlinePayInvoice}
          currentUser={currentUser}
          onSuccess={() => { refetchInvoices(); refetchPayments(); setOfflinePayInvoice(null); }}
        />
      )}

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          open={!!receiptData}
          onClose={() => setReceiptData(null)}
          payment={receiptData.payment}
          invoice={receiptData.invoice}
          student={receiptData.student}
          term={receiptData.term}
        />
      )}
    </div>
  );
}