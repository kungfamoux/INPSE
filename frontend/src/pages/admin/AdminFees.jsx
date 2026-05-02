import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import PaymentMethodBadge from "../components/fees/PaymentMethodBadge";
import ReceiptModal from "../components/fees/ReceiptModal";
import StatCard from "../components/portal/StatCard";
import {
  Plus, Trash2, Eye, CreditCard, CheckCircle, AlertCircle,
  FileText, Upload, Download, Search, X, Users, Pencil,
  DollarSign, Receipt
} from "lucide-react";
import { format } from "date-fns";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ["#f97316", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
const TODAY = new Date().toISOString().split("T")[0];

function genReceiptNo() {
  return "RCP" + Date.now().toString().slice(-8);
}
function genInvoiceNo() {
  return "INV" + Date.now().toString().slice(-8);
}

export default function AdminFees({ currentUser }) {
  const qc = useQueryClient();

  // --- State ---
  const [tab, setTab] = useState("invoices");
  // Fee structure
  const [showStructureDialog, setShowStructureDialog] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [structureForm, setStructureForm] = useState({ class_id: "", term_id: "", session_id: "", items: [], notes: "" });
  const [newItem, setNewItem] = useState({ name: "", amount: "", is_mandatory: true });
  // Invoice
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [bulkClass, setBulkClass] = useState("");
  const [bulkTerm, setBulkTerm] = useState("");
  const [manualInvoice, setManualInvoice] = useState({ student_id: "", term_id: "", items: [], discount: 0, discount_reason: "", due_date: "", notes: "" });
  const [invoiceMode, setInvoiceMode] = useState("bulk"); // "bulk" or "manual"
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [invoiceClassFilter, setInvoiceClassFilter] = useState("all");
  // Payment
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "cash", reference: "", date: TODAY, notes: "", proof_url: "" });
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  // Discount
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [discountInvoice, setDiscountInvoice] = useState(null);
  const [discountForm, setDiscountForm] = useState({ discount: "", reason: "" });
  // Receipt
  const [receiptData, setReceiptData] = useState(null);
  // View payments for invoice
  const [viewPaymentsInvoice, setViewPaymentsInvoice] = useState(null);

  // --- Data ---
  const { data: feeStructures = [], isLoading: loadingStructures } = useQuery({ queryKey: ["fee-structures"], queryFn: () => base44.entities.FeeStructure.list() });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({ queryKey: ["invoices"], queryFn: () => base44.entities.FeeInvoice.list("-created_date", 1000) });
  const { data: payments = [], isLoading: loadingPayments } = useQuery({ queryKey: ["payments"], queryFn: () => base44.entities.Payment.list("-created_date", 500) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => base44.entities.AcademicSession.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.filter({ status: "active" }) });

  const { data: viewInvPayments = [] } = useQuery({
    queryKey: ["inv-payments", viewPaymentsInvoice?.id],
    queryFn: () => base44.entities.Payment.filter({ invoice_id: viewPaymentsInvoice.id }),
    enabled: !!viewPaymentsInvoice?.id,
  });

  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`.trim()]));
  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));
  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
  const currentTerm = terms.find(t => t.is_current);

  // --- Mutations ---
  const saveStructure = useMutation({
    mutationFn: async (data) => {
      const total = data.items.reduce((s, i) => s + Number(i.amount || 0), 0);
      const payload = { ...data, total };
      if (editingStructure) return base44.entities.FeeStructure.update(editingStructure.id, payload);
      return base44.entities.FeeStructure.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries(["fee-structures"]); setShowStructureDialog(false); setEditingStructure(null); },
  });

  const deleteStructure = useMutation({
    mutationFn: (id) => base44.entities.FeeStructure.delete(id),
    onSuccess: () => qc.invalidateQueries(["fee-structures"]),
  });

  const generateBulkInvoices = useMutation({
    mutationFn: async () => {
      const structure = feeStructures.find(s => s.class_id === bulkClass && s.term_id === bulkTerm);
      if (!structure) throw new Error("No fee structure found for this class/term.");
      const classStudents = students.filter(s => s.class_id === bulkClass);
      const existing = invoices.filter(i => i.class_id === bulkClass && i.term_id === bulkTerm).map(i => i.student_id);
      const toCreate = classStudents.filter(s => !existing.includes(s.id));
      for (const student of toCreate) {
        const subtotal = structure.total || 0;
        await base44.entities.FeeInvoice.create({
          invoice_number: genInvoiceNo(),
          student_id: student.id,
          class_id: bulkClass,
          term_id: bulkTerm,
          session_id: structure.session_id || "",
          items: structure.items,
          subtotal, discount: 0,
          total: subtotal, paid: 0, balance: subtotal,
          status: "unpaid",
          due_date: currentTerm?.end_date || "",
          created_by: currentUser?.email,
        });
      }
      await base44.entities.AuditLog.create({ user_email: currentUser?.email, action: "BULK_GENERATE_INVOICES", entity_type: "FeeInvoice", description: `Generated ${toCreate.length} invoices for class ${classMap[bulkClass]}, ${termMap[bulkTerm]}` });
    },
    onSuccess: () => { qc.invalidateQueries(["invoices"]); setShowInvoiceDialog(false); },
  });

  const createManualInvoice = useMutation({
    mutationFn: async () => {
      const subtotal = manualInvoice.items.reduce((s, i) => s + Number(i.amount || 0), 0);
      const discount = Number(manualInvoice.discount || 0);
      const total = subtotal - discount;
      const student = studentMap[manualInvoice.student_id];
      await base44.entities.FeeInvoice.create({
        invoice_number: genInvoiceNo(),
        ...manualInvoice,
        class_id: student?.class_id || "",
        session_id: terms.find(t => t.id === manualInvoice.term_id)?.session_id || "",
        subtotal, discount, total,
        paid: 0, balance: total, status: "unpaid",
        created_by: currentUser?.email,
      });
    },
    onSuccess: () => { qc.invalidateQueries(["invoices"]); setShowInvoiceDialog(false); },
  });

  const recordPayment = useMutation({
    mutationFn: async () => {
      const inv = payingInvoice;
      let proofUrl = paymentForm.proof_url;
      if (proofFile) {
        setUploadingProof(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile });
        proofUrl = file_url;
        setUploadingProof(false);
      }
      const needsVerification = paymentForm.method === "bank_transfer" || paymentForm.method === "online_paystack";
      const payment = await base44.entities.Payment.create({
        receipt_number: genReceiptNo(),
        invoice_id: inv.id,
        student_id: inv.student_id,
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference,
        proof_url: proofUrl,
        date: paymentForm.date,
        received_by: currentUser?.email,
        notes: paymentForm.notes,
        status: needsVerification ? "pending" : "confirmed",
      });
      if (!needsVerification) {
        const newPaid = (inv.paid || 0) + Number(paymentForm.amount);
        const newBalance = Math.max(0, (inv.total || 0) - newPaid);
        const newStatus = newBalance <= 0 ? "paid" : newPaid > 0 ? "partial" : "unpaid";
        await base44.entities.FeeInvoice.update(inv.id, { paid: newPaid, balance: newBalance, status: newStatus });
      }
      await base44.entities.AuditLog.create({ user_email: currentUser?.email, action: "RECORD_PAYMENT", entity_type: "Payment", entity_id: payment.id, description: `₦${paymentForm.amount} via ${paymentForm.method} for invoice ${inv.invoice_number}` });
      return payment;
    },
    onSuccess: (payment) => {
      qc.invalidateQueries(["invoices"]); qc.invalidateQueries(["payments"]);
      const inv = payingInvoice;
      const updatedInv = { ...inv, paid: (inv.paid || 0) + Number(paymentForm.amount), balance: Math.max(0, (inv.total || 0) - (inv.paid || 0) - Number(paymentForm.amount)), status: Math.max(0, (inv.total || 0) - (inv.paid || 0) - Number(paymentForm.amount)) <= 0 ? "paid" : "partial" };
      setReceiptData({ payment, invoice: updatedInv, student: studentMap[inv.student_id], term: terms.find(t => t.id === inv.term_id) });
      setShowPaymentDialog(false);
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async ({ payment, action }) => {
      await base44.entities.Payment.update(payment.id, { status: action === "confirm" ? "confirmed" : "rejected", verified_by: currentUser?.email, received_by: payment.received_by || currentUser?.email });
      if (action === "confirm") {
        const inv = invoices.find(i => i.id === payment.invoice_id);
        if (inv) {
          const newPaid = (inv.paid || 0) + (payment.amount || 0);
          const newBalance = Math.max(0, (inv.total || 0) - newPaid);
          const newStatus = newBalance <= 0 ? "paid" : "partial";
          await base44.entities.FeeInvoice.update(inv.id, { paid: newPaid, balance: newBalance, status: newStatus });
        }
      }
      await base44.entities.AuditLog.create({ user_email: currentUser?.email, action: action === "confirm" ? "VERIFY_PAYMENT" : "REJECT_PAYMENT", entity_type: "Payment", entity_id: payment.id });
    },
    onSuccess: () => { qc.invalidateQueries(["payments"]); qc.invalidateQueries(["invoices"]); },
  });

  const applyDiscount = useMutation({
    mutationFn: async () => {
      const inv = discountInvoice;
      const discount = Number(discountForm.discount);
      const newTotal = Math.max(0, (inv.subtotal || inv.total) - discount);
      const newBalance = Math.max(0, newTotal - (inv.paid || 0));
      await base44.entities.FeeInvoice.update(inv.id, { discount, discount_reason: discountForm.reason, total: newTotal, balance: newBalance, status: newBalance <= 0 ? "paid" : inv.paid > 0 ? "partial" : "unpaid" });
      await base44.entities.AuditLog.create({ user_email: currentUser?.email, action: "APPLY_DISCOUNT", entity_type: "FeeInvoice", entity_id: inv.id, description: `Discount ₦${discount}: ${discountForm.reason}` });
    },
    onSuccess: () => { qc.invalidateQueries(["invoices"]); setShowDiscountDialog(false); setDiscountInvoice(null); },
  });

  // --- Computed ---
  const totalBilled = invoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.paid || 0), 0);
  const totalBalance = invoices.reduce((s, i) => s + (i.balance || 0), 0);
  const pendingVerification = payments.filter(p => p.status === "pending" || p.status === "pending_verification").length;

  const filteredInvoices = invoices.filter(inv => {
    if (invoiceStatusFilter !== "all" && inv.status !== invoiceStatusFilter) return false;
    if (invoiceClassFilter !== "all" && inv.class_id !== invoiceClassFilter) return false;
    if (invoiceSearch) {
      const s = studentMap[inv.student_id];
      const name = s ? `${s.first_name} ${s.last_name}`.toLowerCase() : "";
      const admNo = (s?.admission_no || "").toLowerCase();
      const invNo = (inv.invoice_number || "").toLowerCase();
      if (!name.includes(invoiceSearch.toLowerCase()) && !admNo.includes(invoiceSearch.toLowerCase()) && !invNo.includes(invoiceSearch.toLowerCase())) return false;
    }
    return true;
  });

  // Payment method breakdown
  const methodBreakdown = ["cash", "bank_transfer", "card", "online_paystack"].map(m => ({
    name: m.replace("_", " ").replace("online ", ""),
    value: payments.filter(p => p.method === m && p.status === "confirmed").reduce((s, p) => s + (p.amount || 0), 0),
  })).filter(d => d.value > 0);

  // CSV export
  const exportCSV = () => {
    const rows = [["Invoice No", "Student", "Class", "Term", "Subtotal", "Discount", "Total", "Paid", "Balance", "Status", "Due Date"]];
    filteredInvoices.forEach(inv => {
      const s = studentMap[inv.student_id];
      rows.push([inv.invoice_number || "", s ? `${s.first_name} ${s.last_name}` : "", classMap[inv.class_id] || "", termMap[inv.term_id] || "", inv.subtotal || 0, inv.discount || 0, inv.total || 0, inv.paid || 0, inv.balance || 0, inv.status, inv.due_date || ""]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "invoices.csv"; a.click();
  };

  const openStructureDialog = (structure = null) => {
    setEditingStructure(structure);
    setStructureForm(structure ? { ...structure } : { class_id: "", term_id: "", session_id: "", items: [], notes: "" });
    setShowStructureDialog(true);
  };

  const addItemToStructure = () => {
    if (!newItem.name || !newItem.amount) return;
    setStructureForm(f => ({ ...f, items: [...f.items, { ...newItem, amount: Number(newItem.amount) }] }));
    setNewItem({ name: "", amount: "", is_mandatory: true });
  };

  const tabCls = "rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white";

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Billed" value={`₦${(totalBilled/1000).toFixed(0)}k`} icon={CreditCard} color="blue" />
        <StatCard title="Collected" value={`₦${(totalPaid/1000).toFixed(0)}k`} icon={CheckCircle} color="green" />
        <StatCard title="Outstanding" value={`₦${(totalBalance/1000).toFixed(0)}k`} icon={AlertCircle} color="red" />
        <StatCard title="Pending Verification" value={pendingVerification} icon={FileText} color="orange" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="invoices" className={tabCls}>Invoices</TabsTrigger>
          <TabsTrigger value="payments" className={tabCls}>Payments</TabsTrigger>
          <TabsTrigger value="structure" className={tabCls}>Fee Structure</TabsTrigger>
          <TabsTrigger value="reports" className={tabCls}>Reports</TabsTrigger>
        </TabsList>

        {/* ── INVOICES ── */}
        <TabsContent value="invoices" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search student, invoice no..." value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} className="pl-9 rounded-xl" />
            </div>
            <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
              <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={invoiceClassFilter} onValueChange={setInvoiceClassFilter}>
              <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 rounded-xl"><Download className="w-4 h-4" />CSV</Button>
            <Button size="sm" onClick={() => { setInvoiceMode("bulk"); setShowInvoiceDialog(true); }} className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
              <Plus className="w-4 h-4" /> Generate Invoices
            </Button>
          </div>

          <div className="text-xs text-gray-500 px-1">{filteredInvoices.length} invoices</div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Invoice No", "Student", "Class", "Term", "Total", "Paid", "Balance", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingInvoices ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={9}><div className="h-12 m-3 bg-gray-50 rounded animate-pulse" /></td></tr>
                )) : filteredInvoices.map(inv => {
                  const student = studentMap[inv.student_id];
                  return (
                    <tr key={inv.id} className="hover:bg-orange-50/20">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{inv.invoice_number || inv.id?.slice(-6)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">{student ? `${student.first_name} ${student.last_name}` : "—"}</p>
                        <p className="text-xs text-gray-400">{student?.admission_no || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{classMap[inv.class_id] || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{termMap[inv.term_id] || "—"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">₦{(inv.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">₦{(inv.paid || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">₦{(inv.balance || 0).toLocaleString()}</td>
                      <td className="px-4 py-3"><FeeStatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" title="View payments" className="h-7 w-7 p-0" onClick={() => setViewPaymentsInvoice(inv)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {inv.status !== "paid" && (
                            <Button size="sm" variant="ghost" title="Record payment" className="h-7 text-xs text-orange-600 hover:bg-orange-50 gap-1"
                              onClick={() => { setPayingInvoice(inv); setPaymentForm({ amount: inv.balance || "", method: "cash", reference: "", date: TODAY, notes: "", proof_url: "" }); setShowPaymentDialog(true); }}>
                              <CreditCard className="w-3.5 h-3.5" /> Pay
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" title="Apply discount" className="h-7 w-7 p-0 text-purple-500 hover:bg-purple-50"
                            onClick={() => { setDiscountInvoice(inv); setDiscountForm({ discount: inv.discount || 0, reason: inv.discount_reason || "" }); setShowDiscountDialog(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loadingInvoices && filteredInvoices.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-sm text-gray-400">No invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── PAYMENTS ── */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          {/* Pending verification banner */}
          {pendingVerification > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-700"><strong>{pendingVerification} payment(s)</strong> awaiting verification (bank transfer / Paystack / Offline Cash)</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Receipt No", "Student", "Amount", "Method", "Date", "Reference", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingPayments ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={8}><div className="h-12 m-3 bg-gray-50 rounded animate-pulse" /></td></tr>
                )) : payments.map(p => {
                  const student = studentMap[p.student_id];
                  const inv = invoices.find(i => i.id === p.invoice_id);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.receipt_number || p.id?.slice(-6)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{student ? `${student.first_name} ${student.last_name}` : "—"}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">₦{(p.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3"><PaymentMethodBadge method={p.method} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.date ? format(new Date(p.date), "dd MMM yyyy") : "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.reference || "—"}</td>
                      <td className="px-4 py-3"><FeeStatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.proof_url && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(p.proof_url, "_blank")} title="View proof">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {(p.status === "pending" || p.status === "pending_verification") && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600 hover:bg-green-50 gap-1"
                                onClick={() => verifyPayment.mutate({ payment: p, action: "confirm" })}>
                                <CheckCircle className="w-3.5 h-3.5" /> Verify
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-50 gap-1"
                                onClick={() => verifyPayment.mutate({ payment: p, action: "reject" })}>
                                <X className="w-3.5 h-3.5" /> Reject
                              </Button>
                            </>
                          )}
                          {p.status === "confirmed" && inv && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-orange-600 gap-1"
                              onClick={() => setReceiptData({ payment: p, invoice: inv, student, term: terms.find(t => t.id === inv.term_id) })}>
                              <Receipt className="w-3.5 h-3.5" /> Receipt
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loadingPayments && payments.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── FEE STRUCTURE ── */}
        <TabsContent value="structure" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => openStructureDialog()} className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white rounded-xl">
              <Plus className="w-4 h-4" /> New Fee Structure
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingStructures ? Array(4).fill(0).map((_, i) => <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse" />) :
              feeStructures.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{classMap[s.class_id] || "—"}</p>
                      <p className="text-xs text-gray-400">{termMap[s.term_id] || "—"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openStructureDialog(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50" onClick={() => deleteStructure.mutate(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="space-y-1 mb-3">
                    {(s.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs"><span className="text-gray-600">{item.name}</span><span className="font-medium">₦{(item.amount || 0).toLocaleString()}</span></div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
                    <span>Total</span><span className="text-orange-600">₦{(s.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            {!loadingStructures && feeStructures.length === 0 && (
              <div className="col-span-3 text-center py-16 text-sm text-gray-400">No fee structures yet. Click "New Fee Structure" to create one.</div>
            )}
          </div>
        </TabsContent>

        {/* ── REPORTS ── */}
        <TabsContent value="reports" className="mt-4 space-y-6">
          {/* Debtors */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Top Debtors</h3>
              <span className="text-sm text-red-600 font-semibold">₦{totalBalance.toLocaleString()} outstanding</span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["#", "Student", "Class", "Total", "Paid", "Balance", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.filter(i => (i.balance || 0) > 0).sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 15).map((inv, idx) => {
                  const student = studentMap[inv.student_id];
                  return (
                    <tr key={inv.id} className="hover:bg-red-50/20">
                      <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3"><p className="text-sm font-semibold text-gray-900">{student ? `${student.first_name} ${student.last_name}` : "—"}</p><p className="text-xs text-gray-400">{student?.admission_no}</p></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{classMap[inv.class_id] || "—"}</td>
                      <td className="px-4 py-3 text-sm">₦{(inv.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600">₦{(inv.paid || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-bold text-red-600">₦{(inv.balance || 0).toLocaleString()}</td>
                      <td className="px-4 py-3"><FeeStatusBadge status={inv.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
              {methodBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={methodBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ₦${(value / 1000).toFixed(0)}k`} fontSize={11}>
                      {methodBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 py-8 text-center">No payment data yet.</p>}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Collections by Class</h3>
              {classes.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={classes.map(c => {
                    const classInvs = invoices.filter(i => i.class_id === c.id);
                    return { name: `${c.name}${c.arm ? " " + c.arm : ""}`, collected: classInvs.reduce((s, i) => s + (i.paid || 0), 0), outstanding: classInvs.reduce((s, i) => s + (i.balance || 0), 0) };
                  }).filter(d => d.collected + d.outstanding > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                    <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="outstanding" name="Outstanding" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Generate Invoice Dialog ── */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Generate Invoices</DialogTitle></DialogHeader>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setInvoiceMode("bulk")} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${invoiceMode === "bulk" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>Bulk (by Class)</button>
            <button onClick={() => setInvoiceMode("manual")} className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${invoiceMode === "manual" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-200"}`}>Manual (Single Student)</button>
          </div>
          {invoiceMode === "bulk" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Class *</label>
                <Select value={bulkClass} onValueChange={setBulkClass}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class..." /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Term *</label>
                <Select value={bulkTerm} onValueChange={setBulkTerm}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select term..." /></SelectTrigger>
                  <SelectContent>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {bulkClass && bulkTerm && (
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                  {feeStructures.find(s => s.class_id === bulkClass && s.term_id === bulkTerm)
                    ? `✓ Fee structure found. Will generate for ${students.filter(s => s.class_id === bulkClass).length} students (skipping existing).`
                    : "⚠ No fee structure found for this class/term. Please create one first."}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
                <Button disabled={!bulkClass || !bulkTerm || generateBulkInvoices.isPending || !feeStructures.find(s => s.class_id === bulkClass && s.term_id === bulkTerm)}
                  onClick={() => generateBulkInvoices.mutate()}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                  {generateBulkInvoices.isPending ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Student *</label>
                <Select value={manualInvoice.student_id} onValueChange={v => setManualInvoice(f => ({ ...f, student_id: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select student..." /></SelectTrigger>
                  <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_no})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Term *</label>
                <Select value={manualInvoice.term_id} onValueChange={v => setManualInvoice(f => ({ ...f, term_id: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select term..." /></SelectTrigger>
                  <SelectContent>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Fee Items</label>
                {manualInvoice.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-1.5">
                    <Input value={item.name} readOnly className="rounded-xl text-sm" />
                    <Input value={`₦${item.amount}`} readOnly className="w-28 rounded-xl text-sm" />
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setManualInvoice(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Fee name" value={newItem.name} onChange={e => setNewItem(f => ({ ...f, name: e.target.value }))} className="rounded-xl text-sm" />
                  <Input placeholder="Amount" type="number" value={newItem.amount} onChange={e => setNewItem(f => ({ ...f, amount: e.target.value }))} className="w-28 rounded-xl text-sm" />
                  <Button size="sm" variant="outline" onClick={() => { if (newItem.name && newItem.amount) { setManualInvoice(f => ({ ...f, items: [...f.items, { name: newItem.name, amount: Number(newItem.amount) }] })); setNewItem({ name: "", amount: "", is_mandatory: true }); } }} className="rounded-xl">Add</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Discount (₦)</label>
                  <Input type="number" value={manualInvoice.discount} onChange={e => setManualInvoice(f => ({ ...f, discount: e.target.value }))} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Due Date</label>
                  <Input type="date" value={manualInvoice.due_date} onChange={e => setManualInvoice(f => ({ ...f, due_date: e.target.value }))} className="rounded-xl" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Cancel</Button>
                <Button disabled={!manualInvoice.student_id || !manualInvoice.term_id || createManualInvoice.isPending}
                  onClick={() => createManualInvoice.mutate()}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                  Create Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Payment Dialog ── */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          {payingInvoice && (
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-xl p-3 text-sm">
                <p className="font-semibold text-gray-900">{studentMap[payingInvoice.student_id] ? `${studentMap[payingInvoice.student_id].first_name} ${studentMap[payingInvoice.student_id].last_name}` : "—"}</p>
                <div className="flex gap-4 mt-1 text-gray-600">
                  <span>Total: ₦{(payingInvoice.total || 0).toLocaleString()}</span>
                  <span>Paid: ₦{(payingInvoice.paid || 0).toLocaleString()}</span>
                  <span className="text-red-600 font-semibold">Balance: ₦{(payingInvoice.balance || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Amount *</label>
                  <Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Method</label>
                  <Select value={paymentForm.method} onValueChange={v => setPaymentForm(f => ({ ...f, method: v }))}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="online_paystack">Paystack Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Date</label>
                  <Input type="date" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Reference</label>
                  <Input value={paymentForm.reference} onChange={e => setPaymentForm(f => ({ ...f, reference: e.target.value }))} className="rounded-xl" placeholder="Txn ref..." />
                </div>
              </div>
              {(paymentForm.method === "bank_transfer" || paymentForm.method === "online_paystack") && (
                <div>
                  <label className="text-sm font-medium block mb-1.5">Upload Payment Proof</label>
                  <Input type="file" accept="image/*,application/pdf" onChange={e => setProofFile(e.target.files[0])} className="rounded-xl text-sm" />
                  <p className="text-xs text-gray-400 mt-1">Will be reviewed by Admin/Accountant before confirmation.</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1.5">Notes</label>
                <Input value={paymentForm.notes} onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))} className="rounded-xl" placeholder="Optional notes..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
                <Button disabled={!paymentForm.amount || recordPayment.isPending || uploadingProof}
                  onClick={() => recordPayment.mutate()}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                  {recordPayment.isPending || uploadingProof ? "Processing..." : "Record Payment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Fee Structure Dialog ── */}
      <Dialog open={showStructureDialog} onOpenChange={setShowStructureDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingStructure ? "Edit" : "New"} Fee Structure</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Class *</label>
                <Select value={structureForm.class_id} onValueChange={v => setStructureForm(f => ({ ...f, class_id: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select class..." /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Term *</label>
                <Select value={structureForm.term_id} onValueChange={v => setStructureForm(f => ({ ...f, term_id: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select term..." /></SelectTrigger>
                  <SelectContent>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Fee Items</label>
              {(structureForm.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <Input value={item.name} onChange={e => setStructureForm(f => ({ ...f, items: f.items.map((it, j) => j === i ? { ...it, name: e.target.value } : it) }))} className="rounded-xl text-sm flex-1" placeholder="Fee name" />
                  <Input type="number" value={item.amount} onChange={e => setStructureForm(f => ({ ...f, items: f.items.map((it, j) => j === i ? { ...it, amount: Number(e.target.value) } : it) }))} className="w-28 rounded-xl text-sm" placeholder="Amount" />
                  <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => setStructureForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Input placeholder="e.g. Tuition Fee" value={newItem.name} onChange={e => setNewItem(f => ({ ...f, name: e.target.value }))} className="rounded-xl text-sm flex-1" />
                <Input placeholder="Amount" type="number" value={newItem.amount} onChange={e => setNewItem(f => ({ ...f, amount: e.target.value }))} className="w-28 rounded-xl text-sm" />
                <Button size="sm" variant="outline" onClick={addItemToStructure} className="rounded-xl">+ Add</Button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-700">Total: ₦{(structureForm.items || []).reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString()}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowStructureDialog(false)}>Cancel</Button>
                <Button disabled={!structureForm.class_id || !structureForm.term_id || saveStructure.isPending}
                  onClick={() => saveStructure.mutate(structureForm)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                  {saveStructure.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Discount Dialog ── */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Apply Discount</DialogTitle></DialogHeader>
          {discountInvoice && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-xl p-3 text-sm">
                <p className="font-semibold">{studentMap[discountInvoice.student_id] ? `${studentMap[discountInvoice.student_id].first_name} ${studentMap[discountInvoice.student_id].last_name}` : "—"}</p>
                <p className="text-gray-500">Invoice total: ₦{(discountInvoice.total || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Discount Amount (₦)</label>
                <Input type="number" value={discountForm.discount} onChange={e => setDiscountForm(f => ({ ...f, discount: e.target.value }))} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Reason *</label>
                <Textarea value={discountForm.reason} onChange={e => setDiscountForm(f => ({ ...f, reason: e.target.value }))} className="text-sm" placeholder="e.g. Staff child discount, scholarship..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDiscountDialog(false)}>Cancel</Button>
                <Button disabled={!discountForm.reason || applyDiscount.isPending}
                  onClick={() => applyDiscount.mutate()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white">
                  Apply Discount
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── View Invoice Payments Dialog ── */}
      <Dialog open={!!viewPaymentsInvoice} onOpenChange={v => !v && setViewPaymentsInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Payment History — {viewPaymentsInvoice?.invoice_number}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {viewInvPayments.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No payments recorded.</p> :
              viewInvPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">₦{(p.amount || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{p.date} · {p.reference || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <PaymentMethodBadge method={p.method} />
                    <FeeStatusBadge status={p.status} />
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

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