import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { Download, TrendingUp, Users, GraduationCap, CreditCard, ShoppingBag, BarChart3 } from "lucide-react";

const COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function ProprietorReports({ currentUser }) {
  const [activeReport, setActiveReport] = useState("overview");

  const { data: students = [] } = useQuery({ queryKey: ["stu-rep"], queryFn: () => base44.entities.Student.list("-created_date", 500) });
  const { data: invoices = [] } = useQuery({ queryKey: ["inv-rep"], queryFn: () => base44.entities.FeeInvoice.list("-created_date", 500) });
  const { data: storeOrders = [] } = useQuery({ queryKey: ["ord-rep"], queryFn: () => base44.entities.StoreOrder.list("-created_date", 500) });
  const { data: applications = [] } = useQuery({ queryKey: ["app-rep"], queryFn: () => base44.entities.AdmissionApplication.list("-created_date", 100) });
  const { data: attendance = [] } = useQuery({ queryKey: ["att-rep"], queryFn: () => base44.entities.Attendance.list("-created_date", 500) });
  const { data: classes = [] } = useQuery({ queryKey: ["cls-rep"], queryFn: () => base44.entities.SchoolClass.list("name", 50) });

  const studentsByStatus = [
    { name: "Active", value: students.filter(s => s.status === "active").length },
    { name: "Pending", value: students.filter(s => s.status === "pending_admission").length },
    { name: "Inactive", value: students.filter(s => s.status === "inactive").length },
    { name: "Graduated", value: students.filter(s => s.status === "graduated").length },
  ];

  const admissionsByStatus = [
    { name: "Pending", value: applications.filter(a => a.status === "pending").length },
    { name: "Under Review", value: applications.filter(a => a.status === "under_review").length },
    { name: "Accepted", value: applications.filter(a => a.status === "accepted").length },
    { name: "Rejected", value: applications.filter(a => a.status === "rejected").length },
  ];

  const storeByStatus = [
    { name: "Pending", value: storeOrders.filter(o => o.status === "pending").length },
    { name: "Paid", value: storeOrders.filter(o => o.status === "paid").length },
    { name: "Fulfilled", value: storeOrders.filter(o => o.status === "fulfilled").length },
  ];

  const feesByStatus = [
    { name: "Unpaid", value: invoices.filter(i => i.status === "unpaid").length },
    { name: "Partial", value: invoices.filter(i => i.status === "partial").length },
    { name: "Paid", value: invoices.filter(i => i.status === "paid").length },
  ];

  const monthlyAdmissions = [
    { month: "Sep", apps: 12, accepted: 8 },
    { month: "Oct", apps: 18, accepted: 14 },
    { month: "Nov", apps: 7, accepted: 5 },
    { month: "Dec", apps: 3, accepted: 2 },
    { month: "Jan", apps: 22, accepted: 16 },
    { month: "Feb", apps: applications.length, accepted: applications.filter(a => a.status === "accepted").length },
  ];

  const reports = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "students", label: "Students", icon: Users },
    { id: "admissions", label: "Admissions", icon: GraduationCap },
    { id: "finance", label: "Finance", icon: CreditCard },
    { id: "store", label: "Store", icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-500 text-sm mt-1">Comprehensive data analytics across all modules</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export Report</Button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 flex-wrap">
        {reports.map(r => (
          <button key={r.id} onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeReport === r.id
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md shadow-orange-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-200"
            }`}>
            <r.icon className="w-4 h-4" />
            {r.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeReport === "overview" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: students.length, active: students.filter(s=>s.status==="active").length, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Total Revenue", value: `₦${((invoices.reduce((s,i)=>s+(i.paid||0),0) + storeOrders.filter(o=>o.payment_status==="paid").reduce((s,o)=>s+(o.total||0),0))/1000).toFixed(0)}k`, active: null, color: "text-green-600", bg: "bg-green-50" },
            { label: "Applications", value: applications.length, active: applications.filter(a=>a.status==="accepted").length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Store Orders", value: storeOrders.length, active: storeOrders.filter(o=>o.status==="fulfilled").length, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-5`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-medium text-gray-600 mt-1">{s.label}</p>
              {s.active !== null && <p className="text-[11px] text-gray-400 mt-0.5">{s.active} active</p>}
            </div>
          ))}
          <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Student Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={studentsByStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, value}) => `${name}: ${value}`} fontSize={10}>
                {studentsByStatus.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Fee Collection Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={feesByStatus}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="value" name="Invoices" fill="#f97316" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Students */}
      {activeReport === "students" && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Students by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={studentsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({name,value,percent}) => `${name}: ${value} (${(percent*100).toFixed(0)}%)`} fontSize={10}>
                {studentsByStatus.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Gender Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={[
                { name: "Male", value: students.filter(s=>s.gender==="male").length },
                { name: "Female", value: students.filter(s=>s.gender==="female").length },
              ]} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name,value}) => `${name}: ${value}`} fontSize={10}>
                <Cell fill="#3b82f6" /><Cell fill="#ec4899" />
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Admissions */}
      {activeReport === "admissions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Applications vs Acceptances</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyAdmissions}>
                <defs>
                  <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Area type="monotone" dataKey="apps" name="Applications" stroke="#f97316" fill="url(#appGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid sm:grid-cols-4 gap-4">
            {admissionsByStatus.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-3xl font-bold" style={{color: COLORS[i]}}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finance */}
      {activeReport === "finance" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Total Billed", value: invoices.reduce((s,i)=>s+(i.total||0),0), color: "text-gray-900" },
              { label: "Collected", value: invoices.reduce((s,i)=>s+(i.paid||0),0), color: "text-green-700" },
              { label: "Outstanding", value: invoices.reduce((s,i)=>s+(i.balance||0),0), color: "text-red-700" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className={`text-3xl font-bold ${s.color}`}>₦{(s.value/1000).toFixed(1)}k</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">₦{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Fee Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feesByStatus}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="value" name="Count" radius={[4,4,0,0]}>
                  {feesByStatus.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Store */}
      {activeReport === "store" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Total Orders", value: storeOrders.length, color: "text-gray-900" },
              { label: "Store Revenue", value: `₦${(storeOrders.filter(o=>o.payment_status==="paid").reduce((s,o)=>s+(o.total||0),0)/1000).toFixed(1)}k`, color: "text-purple-700" },
              { label: "Fulfillment Rate", value: storeOrders.length > 0 ? `${((storeOrders.filter(o=>o.status==="fulfilled").length / storeOrders.length)*100).toFixed(0)}%` : "0%", color: "text-green-700" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={storeByStatus}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize:11}} /><YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="value" name="Orders" radius={[4,4,0,0]}>
                  {storeByStatus.map((_,i) => <Cell key={i} fill={COLORS[i+2]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}