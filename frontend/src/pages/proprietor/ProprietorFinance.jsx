import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeeStatusBadge from "../components/fees/FeeStatusBadge";
import {
  CreditCard, TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  Download, RefreshCcw, BarChart3, Users, Receipt, Percent
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from "recharts";
import { format } from "date-fns";

const COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#ef4444"];
const tabCls = "rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white";

export default function ProprietorFinance({ currentUser }) {
  const [termFilter, setTermFilter] = useState("all");

  const { data: invoices = [] } = useQuery({ queryKey: ["invoices-fin"], queryFn: () => base44.entities.FeeInvoice.list("-created_date", 1000) });
  const { data: payments = [] } = useQuery({ queryKey: ["payments-fin"], queryFn: () => base44.entities.Payment.list("-created_date", 500) });
  const { data: storeOrders = [] } = useQuery({ queryKey: ["store-orders-fin"], queryFn: () => base44.entities.StoreOrder.list("-created_date", 500) });
  const { data: students = [] } = useQuery({ queryKey: ["students-fin"], queryFn: () => base44.entities.Student.list("-created_date", 500) });
  const { data: terms = [] } = useQuery({ queryKey: ["terms-fin"], queryFn: () => base44.entities.Term.list("-created_date", 20) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes-fin"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: auditLogs = [] } = useQuery({ queryKey: ["audit-fin"], queryFn: () => base44.entities.AuditLog.filter({ entity_type: "Payment" }) });

  const filteredInvoices = termFilter === "all" ? invoices : invoices.filter(i => i.term_id === termFilter);

  const totalExpected = filteredInvoices.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = filteredInvoices.reduce((s, i) => s + (i.paid || 0), 0);
  const totalOutstanding = filteredInvoices.reduce((s, i) => s + (i.balance || 0), 0);
  const totalDiscounts = filteredInvoices.reduce((s, i) => s + (i.discount || 0), 0);
  const storeRevenue = storeOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.total || 0), 0);
  const collectionRate = totalExpected > 0 ? ((totalPaid / totalExpected) * 100).toFixed(1) : 0;

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`.trim()]));
  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));

  // Top debtors
  const debtors = filteredInvoices
    .filter(i => (i.balance || 0) > 0)
    .sort((a, b) => (b.balance || 0) - (a.balance || 0));

  // Payment method breakdown (confirmed only)
  const confirmedPayments = payments.filter(p => p.status === "confirmed");
  const methodBreakdown = ["cash", "bank_transfer", "card", "online_paystack"].map(m => ({
    name: m.replace("online_paystack", "Paystack").replace("bank_transfer", "Bank").replace("cash", "Cash").replace("card", "Card"),
    value: confirmedPayments.filter(p => p.method === m).reduce((s, p) => s + (p.amount || 0), 0),
  })).filter(d => d.value > 0);

  // Payment status breakdown
  const paymentByStatus = [
    { name: "Paid", value: filteredInvoices.filter(i => i.status === "paid").length, color: "#10b981" },
    { name: "Partial", value: filteredInvoices.filter(i => i.status === "partial").length, color: "#f59e0b" },
    { name: "Unpaid", value: filteredInvoices.filter(i => i.status === "unpaid").length, color: "#ef4444" },
    { name: "Overdue", value: filteredInvoices.filter(i => i.status === "overdue").length, color: "#f97316" },
  ];

  // Collections by class
  const classSummary = classes.map(c => {
    const cInvs = filteredInvoices.filter(i => i.class_id === c.id);
    return {
      name: `${c.name}${c.arm ? " " + c.arm : ""}`,
      collected: cInvs.reduce((s, i) => s + (i.paid || 0), 0),
      outstanding: cInvs.reduce((s, i) => s + (i.balance || 0), 0),
    };
  }).filter(d => d.collected + d.outstanding > 0);

  // Recent payments by date (last 30 days)
  const last30Payments = confirmedPayments
    .filter(p => p.date && new Date(p.date) > new Date(Date.now() - 30 * 864e5))
    .reduce((acc, p) => {
      const d = p.date?.split("T")[0];
      acc[d] = (acc[d] || 0) + (p.amount || 0);
      return acc;
    }, {});
  const dailyRevenue = Object.entries(last30Payments).sort().map(([date, amount]) => ({ date: format(new Date(date), "MMM d"), amount }));

  // Export CSV (all invoices)
  const exportCSV = () => {
    const rows = [["Invoice No", "Student", "Class", "Term", "Total", "Paid", "Balance", "Discount", "Status"]];
    filteredInvoices.forEach(inv => {
      const s = studentMap[inv.student_id];
      rows.push([inv.invoice_number || "", s ? `${s.first_name} ${s.last_name}` : "", classMap[inv.class_id] || "", termMap[inv.term_id] || "", inv.total || 0, inv.paid || 0, inv.balance || 0, inv.discount || 0, inv.status]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "finance_report.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finance & Accounting</h2>
          <p className="text-gray-500 text-sm mt-1">Full financial overview, debtors, and income reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={termFilter} onValueChange={setTermFilter}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="All Terms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-2 rounded-xl"><Download className="w-4 h-4" /> Export CSV</Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Expected", value: `₦${(totalExpected / 1000).toFixed(0)}k`, icon: DollarSign, bg: "bg-orange-50", text: "text-orange-600" },
          { label: "Collected", value: `₦${(totalPaid / 1000).toFixed(0)}k`, icon: TrendingUp, bg: "bg-green-50", text: "text-green-600" },
          { label: "Outstanding", value: `₦${(totalOutstanding / 1000).toFixed(0)}k`, icon: TrendingDown, bg: "bg-red-50", text: "text-red-600" },
          { label: "Discounts Given", value: `₦${(totalDiscounts / 1000).toFixed(0)}k`, icon: Percent, bg: "bg-purple-50", text: "text-purple-600" },
          { label: "Store Revenue", value: `₦${(storeRevenue / 1000).toFixed(0)}k`, icon: BarChart3, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "Collection Rate", value: `${collectionRate}%`, icon: RefreshCcw, bg: "bg-teal-50", text: "text-teal-600" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
              <k.icon className={`w-4 h-4 ${k.text}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className={tabCls}>Overview</TabsTrigger>
          <TabsTrigger value="debtors" className={tabCls}>Debtors ({debtors.length})</TabsTrigger>
          <TabsTrigger value="income" className={tabCls}>Income Report</TabsTrigger>
          <TabsTrigger value="audit" className={tabCls}>Audit Trail</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Daily revenue line chart */}
          {dailyRevenue.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Daily Collections (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="amount" name="Collected" stroke="#f97316" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Collections by class bar */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Collections by Class</h3>
              {classSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={classSummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
                    <Bar dataKey="collected" name="Collected" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="outstanding" name="Outstanding" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>}
            </div>

            {/* Payment status pie */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Invoice Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentByStatus.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {paymentByStatus.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {paymentByStatus.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.name}</div>
                    <span className="font-medium text-gray-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment method breakdown */}
          {methodBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Method Breakdown</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {methodBreakdown.map((m, i) => (
                  <div key={i} className="rounded-xl p-4 text-center" style={{ background: `${COLORS[i]}15` }}>
                    <p className="text-xl font-bold" style={{ color: COLORS[i] }}>₦{(m.value / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-gray-500 mt-1">{m.name}</p>
                    <p className="text-xs text-gray-400">{confirmedPayments.filter(p => p.method === (["cash", "bank_transfer", "card", "online_paystack"])[i]).length} payments</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Debtors ── */}
        <TabsContent value="debtors" className="mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Fee Debtors
              </h3>
              <p className="text-sm font-bold text-red-600">Total: ₦{totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["#", "Student", "Class", "Term", "Total", "Paid", "Balance", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {debtors.slice(0, 50).map((inv, i) => {
                    const student = studentMap[inv.student_id];
                    return (
                      <tr key={inv.id} className="hover:bg-red-50/20">
                        <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{student ? `${student.first_name} ${student.last_name}` : "—"}</p>
                          <p className="text-xs text-gray-400">{student?.admission_no}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{classMap[inv.class_id] || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{termMap[inv.term_id] || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">₦{(inv.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-green-600">₦{(inv.paid || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold text-red-600">₦{(inv.balance || 0).toLocaleString()}</td>
                        <td className="px-4 py-3"><FeeStatusBadge status={inv.status} /></td>
                      </tr>
                    );
                  })}
                  {debtors.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No outstanding balances! 🎉</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── Income Report ── */}
        <TabsContent value="income" className="mt-4 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Fees Expected", value: totalExpected, color: "text-gray-900", bg: "bg-gray-50" },
              { label: "Fees Collected", value: totalPaid, color: "text-green-700", bg: "bg-green-50" },
              { label: "Fees Outstanding", value: totalOutstanding, color: "text-red-700", bg: "bg-red-50" },
              { label: "Total Discounts", value: totalDiscounts, color: "text-purple-700", bg: "bg-purple-50" },
              { label: "Store Revenue", value: storeRevenue, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Total Income", value: totalPaid + storeRevenue, color: "text-orange-700", bg: "bg-orange-50" },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-2xl p-5`}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{item.label}</p>
                <p className={`text-3xl font-bold ${item.color}`}>₦{(item.value / 1000).toFixed(1)}k</p>
                <p className="text-xs text-gray-400 mt-1">₦{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Per-term breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Term-by-Term Breakdown</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Term", "Invoices", "Expected", "Collected", "Outstanding", "Rate"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {terms.map(t => {
                  const tInvs = invoices.filter(i => i.term_id === t.id);
                  const exp = tInvs.reduce((s, i) => s + (i.total || 0), 0);
                  const paid = tInvs.reduce((s, i) => s + (i.paid || 0), 0);
                  const bal = tInvs.reduce((s, i) => s + (i.balance || 0), 0);
                  const rate = exp > 0 ? ((paid / exp) * 100).toFixed(0) : 0;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.name} {t.is_current && <Badge className="text-[10px] bg-green-100 text-green-700 ml-1">Current</Badge>}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{tInvs.length}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">₦{exp.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">₦{paid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">₦{bal.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, rate)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Audit Trail ── */}
        <TabsContent value="audit" className="mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Financial Audit Trail</h3>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Action", "Description", "By", "Time"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${
                        log.action?.includes("VERIFY") ? "bg-green-100 text-green-700" :
                        log.action?.includes("REJECT") ? "bg-red-100 text-red-700" :
                        log.action?.includes("DISCOUNT") ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{log.action?.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.description || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{log.user_email}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{log.created_date ? format(new Date(log.created_date), "dd MMM yyyy, HH:mm") : "—"}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-sm text-gray-400">No financial audit logs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}