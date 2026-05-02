import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Search, Activity, Clock, User, Download, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const ACTION_COLORS = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  APPROVE: "bg-purple-100 text-purple-700",
  LOCK: "bg-orange-100 text-orange-700",
  REJECT: "bg-red-100 text-red-700",
  REVIEW: "bg-yellow-100 text-yellow-700",
  SAVE: "bg-teal-100 text-teal-700",
  LOGIN: "bg-gray-100 text-gray-600",
  PUBLISH: "bg-indigo-100 text-indigo-700",
  ASSIGN: "bg-pink-100 text-pink-700",
};

const STATUS_CONFIG = {
  success: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  failed:  { color: "bg-red-100 text-red-700",     icon: XCircle },
  denied:  { color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
};

const getActionColor = (action) => {
  const prefix = Object.keys(ACTION_COLORS).find(k => action?.startsWith(k));
  return ACTION_COLORS[prefix] || "bg-gray-100 text-gray-600";
};

const PAGE_SIZE = 50;

const MODULES = ["Accounts", "Admissions", "Announcements", "Assessments", "Attendance", "Fees", "Gallery", "Payments", "Results", "Settings", "Staff", "Students"];

export default function ProprietorAuditLogs({ currentUser }) {
  const [search, setSearch]               = useState("");
  const [filterModule, setFilterModule]   = useState("all");
  const [filterRole, setFilterRole]       = useState("all");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]   = useState("");
  const [page, setPage]                   = useState(1);
  const [viewLog, setViewLog]             = useState(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 1000),
  });

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (search) {
        const hay = `${l.user_email} ${l.user_full_name} ${l.action} ${l.summary} ${l.description}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      if (filterModule !== "all" && l.module !== filterModule) return false;
      if (filterRole   !== "all" && l.user_role !== filterRole)  return false;
      if (filterStatus !== "all" && (l.status || "success") !== filterStatus) return false;
      if (filterDateFrom && new Date(l.created_date) < new Date(filterDateFrom)) return false;
      if (filterDateTo   && new Date(l.created_date) > new Date(filterDateTo + "T23:59:59")) return false;
      return true;
    });
  }, [logs, search, filterModule, filterRole, filterStatus, filterDateFrom, filterDateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const userActivity = logs.reduce((acc, l) => { acc[l.user_email] = (acc[l.user_email] || 0) + 1; return acc; }, {});
  const topUsers = Object.entries(userActivity).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handleExportCSV = () => {
    const headers = ["Date", "User Email", "Full Name", "Role", "Action", "Module", "Entity", "Entity ID", "Summary", "Status"];
    const rows = filtered.map(l => [
      l.created_date ? format(new Date(l.created_date), "yyyy-MM-dd HH:mm:ss") : "",
      l.user_email || "",
      l.user_full_name || "",
      l.user_role || "",
      l.action || "",
      l.module || "",
      l.entity_type || "",
      l.entity_id || "",
      (l.summary || l.description || "").replace(/"/g, "'").replace(/,/g, ";"),
      l.status || "success",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `audit-trail-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toDateString();
  const statsData = [
    { label: "Total Events",   value: logs.length,                                                          icon: Activity, bg: "bg-blue-50",   text: "text-blue-600" },
    { label: "Today",          value: logs.filter(l => new Date(l.created_date).toDateString() === today).length, icon: Clock, bg: "bg-orange-50", text: "text-orange-600" },
    { label: "Active Users",   value: Object.keys(userActivity).length,                                     icon: User,     bg: "bg-green-50",  text: "text-green-600" },
    { label: "Failed / Denied",value: logs.filter(l => l.status && l.status !== "success").length,          icon: Shield,   bg: "bg-red-50",    text: "text-red-600" },
  ];

  const hasFilters = filterModule !== "all" || filterRole !== "all" || filterStatus !== "all" || filterDateFrom || filterDateTo || search;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-gray-500 text-sm mt-1">Complete immutable activity log — who did what, when, and where</p>
        </div>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleExportCSV}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsData.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`w-4 h-4 ${s.text}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Top Active Users sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Most Active Users</h3>
          <div className="space-y-3">
            {topUsers.map(([email, count], i) => (
              <div key={email} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 text-orange-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-xs text-gray-700 truncate max-w-[110px]">{email}</p>
                </div>
                <Badge className="bg-orange-100 text-orange-700 text-xs">{count}</Badge>
              </div>
            ))}
            {topUsers.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No logs yet</p>}
          </div>
        </div>

        {/* Main table */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9 text-sm" placeholder="Search by user, action, or summary…" value={search} onChange={e => { setSearch(e.target.value); resetPage(); }} />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={filterModule} onValueChange={v => { setFilterModule(v); resetPage(); }}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Module" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={v => { setFilterRole(v); resetPage(); }}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {["admin", "teacher", "parent", "student", "accountant", "store_manager", "proprietor"].map(r => (
                    <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); resetPage(); }}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <input type="date" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); resetPage(); }}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-orange-300" />
                <span className="text-xs text-gray-400">—</span>
                <input type="date" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); resetPage(); }}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-orange-300" />
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500"
                  onClick={() => { setSearch(""); setFilterModule("all"); setFilterRole("all"); setFilterStatus("all"); setFilterDateFrom(""); setFilterDateTo(""); setPage(1); }}>
                  Clear filters
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Module</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Summary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => <tr key={i}><td colSpan={7}><div className="h-10 m-3 bg-gray-50 rounded animate-pulse" /></td></tr>)
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No audit logs match your filters</td></tr>
                ) : paginated.map(log => {
                  const sc = STATUS_CONFIG[log.status || "success"];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => setViewLog(log)}>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm") : "—"}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-xs font-medium text-gray-800 truncate max-w-[130px]">{log.user_email || "—"}</p>
                        {log.user_role && <p className="text-[10px] text-gray-400 capitalize">{log.user_role.replace("_", " ")}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getActionColor(log.action)} text-[10px] whitespace-nowrap`}>{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{log.module || log.entity_type || "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell max-w-[200px]">
                        <span className="text-xs text-gray-600 truncate block">{log.summary || log.description || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sc.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {log.status || "success"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Eye className="w-3.5 h-3.5 text-gray-300" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Page {page} of {totalPages} · {filtered.length} total records</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!viewLog} onOpenChange={() => setViewLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-orange-500" /> Audit Log Detail
            </DialogTitle>
          </DialogHeader>
          {viewLog && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Timestamp",   viewLog.created_date ? format(new Date(viewLog.created_date), "PPpp") : "—"],
                  ["User Email",  viewLog.user_email || "—"],
                  ["Full Name",   viewLog.user_full_name || "—"],
                  ["Role",        viewLog.user_role || "—"],
                  ["Action",      <Badge className={`${getActionColor(viewLog.action)} text-xs`}>{viewLog.action}</Badge>],
                  ["Status",      (() => { const sc = STATUS_CONFIG[viewLog.status || "success"]; const SI = sc.icon; return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}><SI className="w-3 h-3" />{viewLog.status || "success"}</span>; })()],
                  ["Module",      viewLog.module || "—"],
                  ["Entity Type", viewLog.entity_type || "—"],
                  ["Entity ID",   viewLog.entity_id ? <span className="font-mono text-xs break-all">{viewLog.entity_id}</span> : "—"],
                  ["Page / Route", viewLog.page_route || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{label}</p>
                    <div className="text-gray-900 text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {viewLog.summary && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-[10px] text-blue-500 uppercase font-semibold mb-1">Summary</p>
                  <p className="text-gray-800">{viewLog.summary}</p>
                </div>
              )}

              {viewLog.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Description</p>
                  <p className="text-gray-700">{viewLog.description}</p>
                </div>
              )}

              {(viewLog.old_values || viewLog.new_values) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-[10px] text-red-400 uppercase font-semibold mb-2">Before (Old Values)</p>
                    {viewLog.old_values
                      ? <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-auto max-h-48">{JSON.stringify(viewLog.old_values, null, 2)}</pre>
                      : <p className="text-xs text-gray-400 italic">N/A</p>}
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-[10px] text-green-500 uppercase font-semibold mb-2">After (New Values)</p>
                    {viewLog.new_values
                      ? <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono overflow-auto max-h-48">{JSON.stringify(viewLog.new_values, null, 2)}</pre>
                      : <p className="text-xs text-gray-400 italic">N/A</p>}
                  </div>
                </div>
              )}

              {viewLog.reason && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-[10px] text-yellow-600 uppercase font-semibold mb-1">Reason / Comment</p>
                  <p className="text-gray-700">{viewLog.reason}</p>
                </div>
              )}

              {viewLog.browser_info && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Browser / Device</p>
                  <p className="text-xs text-gray-600 break-all">{viewLog.browser_info}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}