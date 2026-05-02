import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  GraduationCap, Users, CreditCard, TrendingUp, ShoppingBag,
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight,
  BarChart3, BookOpen, CalendarCheck, DollarSign, Package, Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function ProprietorDashboard({ currentUser }) {
  const { data: students = [] } = useQuery({ queryKey: ["students-prop"], queryFn: () => base44.entities.Student.list("-created_date", 500) });
  const { data: staff = [] } = useQuery({ queryKey: ["staff-prop"], queryFn: () => base44.entities.Staff.list("-created_date", 200) });
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices-prop"], queryFn: () => base44.entities.FeeInvoice.list("-created_date", 500) });
  const { data: applications = [] } = useQuery({ queryKey: ["apps-prop"], queryFn: () => base44.entities.AdmissionApplication.list("-created_date", 100) });
  const { data: storeOrders = [] } = useQuery({ queryKey: ["store-orders-prop"], queryFn: () => base44.entities.StoreOrder.list("-created_date", 200) });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements-prop"], queryFn: () => base44.entities.Announcement.list("-created_date", 5) });

  const activeStudents = students.filter(s => s.status === "active").length;
  const pendingAdmissions = applications.filter(a => a.status === "pending").length;
  const totalFeesPaid = invoices.reduce((s, i) => s + (i.paid || 0), 0);
  const totalFeesOutstanding = invoices.reduce((s, i) => s + (i.balance || 0), 0);
  const storeSales = storeOrders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = storeOrders.filter(o => o.status === "pending").length;
  const debtors = invoices.filter(i => (i.balance || 0) > 0).length;

  // Revenue trend (mock months based on data)
  const revenueTrend = [
    { month: "Sep", fees: 1200000, store: 85000 },
    { month: "Oct", fees: 2100000, store: 120000 },
    { month: "Nov", fees: 1800000, store: 95000 },
    { month: "Dec", fees: 900000, store: 65000 },
    { month: "Jan", fees: 2400000, store: 140000 },
    { month: "Feb", fees: totalFeesPaid || 1950000, store: storeSales || 110000 },
  ];

  const kpis = [
    { label: "Active Students", value: activeStudents, icon: GraduationCap, color: "from-orange-500 to-amber-500", bg: "bg-orange-50", text: "text-orange-600", trend: "+12 this term" },
    { label: "Total Staff", value: staff.length, icon: Users, color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", text: "text-blue-600", trend: `${staff.filter(s => s.status === "active").length} active` },
    { label: "Fees Collected", value: `₦${(totalFeesPaid / 1000).toFixed(0)}k`, icon: CreditCard, color: "from-green-500 to-emerald-500", bg: "bg-green-50", text: "text-green-600", trend: `₦${(totalFeesOutstanding / 1000).toFixed(0)}k outstanding` },
    { label: "Store Revenue", value: `₦${(storeSales / 1000).toFixed(0)}k`, icon: ShoppingBag, color: "from-purple-500 to-pink-500", bg: "bg-purple-50", text: "text-purple-600", trend: `${pendingOrders} orders pending` },
    { label: "Pending Admissions", value: pendingAdmissions, icon: Clock, color: "from-yellow-500 to-orange-500", bg: "bg-yellow-50", text: "text-yellow-600", trend: `${applications.filter(a=>a.status==="accepted").length} accepted` },
    { label: "Fee Debtors", value: debtors, icon: AlertTriangle, color: "from-red-500 to-pink-500", bg: "bg-red-50", text: "text-red-600", trend: `₦${(totalFeesOutstanding / 1000).toFixed(0)}k owed` },
  ];

  const topDebtors = invoices
    .filter(i => (i.balance || 0) > 0)
    .sort((a, b) => (b.balance || 0) - (a.balance || 0))
    .slice(0, 5);

  const alerts = [
    pendingAdmissions > 0 && { type: "warning", msg: `${pendingAdmissions} admission application(s) awaiting review` },
    pendingOrders > 0 && { type: "info", msg: `${pendingOrders} store order(s) pending fulfillment` },
    debtors > 0 && { type: "error", msg: `${debtors} student(s) have outstanding fee balances` },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Welcome back, <span className="font-semibold text-orange-600">{currentUser?.full_name?.split(" ")[0] || "Proprietor"}</span> — here's your school at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("ProprietorUsers")}>
            <Button size="sm" variant="outline" className="gap-2"><Users className="w-4 h-4" /> Manage Users</Button>
          </Link>
          <Link to={createPageUrl("ProprietorSettings")}>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white hover:opacity-90">School Settings</Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              a.type === "error" ? "bg-red-50 text-red-700 border border-red-100" :
              a.type === "warning" ? "bg-yellow-50 text-yellow-700 border border-yellow-100" :
              "bg-blue-50 text-blue-700 border border-blue-100"
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.text}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{kpi.label}</p>
            <p className={`text-[11px] mt-1 ${kpi.text}`}>{kpi.trend}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Cash Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Trends</h3>
              <p className="text-xs text-gray-400 mt-0.5">Fees + Store sales by month</p>
            </div>
            <Badge className="bg-green-100 text-green-700 text-xs">This Session</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="storeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `₦${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="fees" name="Fees" stroke="#f97316" fill="url(#feeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="store" name="Store" stroke="#ec4899" fill="url(#storeGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Owner Cash Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Cash Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-green-600 font-medium">Total Collected</p>
              <p className="text-xl font-bold text-green-700 mt-0.5">₦{(totalFeesPaid + storeSales).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <p className="text-xs text-red-600 font-medium">Outstanding Fees</p>
              <p className="text-xl font-bold text-red-700 mt-0.5">₦{totalFeesOutstanding.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-purple-600 font-medium">Store Revenue</p>
              <p className="text-xl font-bold text-purple-700 mt-0.5">₦{storeSales.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <p className="text-xs text-orange-600 font-medium">Expected Income</p>
              <p className="text-xl font-bold text-orange-700 mt-0.5">₦{(totalFeesPaid + totalFeesOutstanding).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Debtors + Quick Access */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top Fee Debtors</h3>
            <Link to={createPageUrl("AdminFees")} className="text-xs text-orange-500 font-medium hover:underline">View All</Link>
          </div>
          {topDebtors.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No outstanding fees!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topDebtors.map((inv, i) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">{i+1}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-800">Student #{inv.student_id?.slice(-6)}</p>
                      <p className="text-[11px] text-gray-400">Term ID: {inv.term_id?.slice(-6)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-red-600">₦{(inv.balance || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Approve Results", icon: CheckCircle, page: "ProprietorResults", color: "bg-green-50 text-green-600" },
              { label: "User Permissions", icon: Users, page: "ProprietorUsers", color: "bg-blue-50 text-blue-600" },
              { label: "School Settings", icon: BarChart3, page: "ProprietorSettings", color: "bg-orange-50 text-orange-600" },
              { label: "Audit Logs", icon: Eye, page: "ProprietorAuditLogs", color: "bg-purple-50 text-purple-600" },
              { label: "Admissions", icon: BookOpen, page: "AdminAdmissions", color: "bg-yellow-50 text-yellow-600" },
              { label: "Fee Reports", icon: CreditCard, page: "ProprietorFinance", color: "bg-pink-50 text-pink-600" },
            ].map(item => (
              <Link key={item.page} to={createPageUrl(item.page)}>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${item.color} hover:opacity-80 transition-opacity cursor-pointer`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}