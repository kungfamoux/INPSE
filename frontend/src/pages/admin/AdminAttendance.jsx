import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Unlock, Eye, AlertTriangle, BarChart3, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { statusBadgeClass } from "../components/attendance/StatusChip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminAttendance({ currentUser }) {
  const qc = useQueryClient();
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reopenSession, setReopenSession] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [viewSession, setViewSession] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["att-sessions-admin"],
    queryFn: () => base44.entities.AttendanceSession.list("-date", 500),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.list() });
  const { data: viewRecords = [] } = useQuery({
    queryKey: ["view-records", viewSession?.id],
    queryFn: () => base44.entities.AttendanceRecord.filter({ session_id: viewSession.id }),
    enabled: !!viewSession?.id,
  });
  const { data: editLogs = [] } = useQuery({
    queryKey: ["att-edit-logs"],
    queryFn: () => base44.entities.AttendanceEditLog.list("-created_date", 200),
  });
  const { data: allRecords = [] } = useQuery({
    queryKey: ["all-att-records"],
    queryFn: () => base44.entities.AttendanceRecord.list("-created_date", 2000),
  });



  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`.trim()]));
  const studentMap = Object.fromEntries(students.map(s => [s.id, `${s.first_name} ${s.last_name}`]));
  const studentClassMap = Object.fromEntries(students.map(s => [s.id, classMap[s.class_id] || "—"]));

  const absenteeism = useMemo(() => {
    const map = {};
    allRecords.forEach(rec => {
      if (!map[rec.student_id]) map[rec.student_id] = { total: 0, absent: 0, late: 0 };
      map[rec.student_id].total++;
      if (rec.status === "absent") map[rec.student_id].absent++;
      if (rec.status === "late") map[rec.student_id].late++;
    });
    return Object.entries(map).map(([studentId, counts]) => ({
      studentId,
      name: studentMap[studentId] || "Unknown",
      className: studentClassMap[studentId] || "—",
      ...counts,
      absentRate: counts.total > 0 ? Math.round((counts.absent / counts.total) * 100) : 0,
    })).sort((a, b) => b.absent - a.absent);
  }, [allRecords, studentMap, studentClassMap]);

  const filtered = sessions.filter(s => {
    if (classFilter !== "all" && s.class_id !== classFilter) return false;
    if (dateFilter && s.date !== dateFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const updateSessionStatus = useMutation({
    mutationFn: ({ id, status, reason }) => base44.entities.AttendanceSession.update(id, { status }),
    onSuccess: async (_, vars) => {
      await base44.entities.AttendanceEditLog.create({
        session_id: vars.id, action: vars.status === "locked" ? "lock" : "reopen",
        reason: vars.reason, edited_by: currentUser?.email,
      });
      qc.invalidateQueries(["att-sessions-admin"]);
      qc.invalidateQueries(["att-edit-logs"]);
      setReopenSession(null);
      setReopenReason("");
    },
  });

  // Per-class attendance rate chart data
  const chartData = classes.map(c => {
    const classSessions = sessions.filter(s => s.class_id === c.id);
    const totalPresent = classSessions.reduce((sum, s) => sum + (s.total_present || 0), 0);
    const totalStudents = classSessions.reduce((sum, s) => sum + (s.total_present || 0) + (s.total_absent || 0) + (s.total_late || 0) + (s.total_excused || 0), 0);
    return { name: `${c.name}${c.arm ? " " + c.arm : ""}`, rate: totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0 };
  }).filter(d => d.rate > 0);

  const statusColor = { draft: "bg-yellow-100 text-yellow-700", submitted: "bg-green-100 text-green-700", locked: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sessions">
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1">
          <TabsTrigger value="sessions" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Sessions</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Class Reports</TabsTrigger>
          <TabsTrigger value="absenteeism" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Absenteeism</TabsTrigger>
          <TabsTrigger value="auditlogs" className="rounded-lg text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44 rounded-xl" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-400 self-center ml-auto">{filtered.length} sessions</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Summary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Marked By</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={6}><div className="h-12 m-3 bg-gray-50 rounded animate-pulse" /></td></tr>)
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.date ? format(new Date(s.date), "MMM d, yyyy") : "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{classMap[s.class_id] || s.class_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600 font-medium">✓{s.total_present || 0}</span>
                        <span className="text-red-600 font-medium">✗{s.total_absent || 0}</span>
                        <span className="text-yellow-600 font-medium">⏱{s.total_late || 0}</span>
                        <span className="text-blue-600 font-medium">📝{s.total_excused || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge className={`text-xs ${statusColor[s.status]}`}>{s.status}</Badge></td>
                    <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-[120px]">{s.marked_by || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setViewSession(s)} title="View records">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {s.status === "submitted" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50 gap-1"
                            onClick={() => updateSessionStatus.mutate({ id: s.id, status: "locked", reason: "Locked by admin" })}>
                            <Lock className="w-3.5 h-3.5" /> Lock
                          </Button>
                        )}
                        {s.status === "locked" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-orange-600 hover:bg-orange-50 gap-1"
                            onClick={() => setReopenSession(s)}>
                            <Unlock className="w-3.5 h-3.5" /> Reopen
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No sessions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Attendance Rate by Class</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={v => `${v}%`} />
                  <Bar dataKey="rate" name="Attendance Rate" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No attendance data yet.</p>
            )}
          </div>

          {/* Per-class summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(c => {
              const classSessions = sessions.filter(s => s.class_id === c.id);
              const totalPresent = classSessions.reduce((sum, s) => sum + (s.total_present || 0), 0);
              const totalAbsent = classSessions.reduce((sum, s) => sum + (s.total_absent || 0), 0);
              const totalLate = classSessions.reduce((sum, s) => sum + (s.total_late || 0), 0);
              const total = totalPresent + totalAbsent + totalLate;
              const rate = total > 0 ? Math.round((totalPresent / total) * 100) : null;
              if (classSessions.length === 0) return null;
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900 text-sm">{c.name} {c.arm || ""}</p>
                    {rate !== null && (
                      <span className={`text-sm font-bold ${rate >= 80 ? "text-green-600" : rate >= 60 ? "text-yellow-600" : "text-red-600"}`}>{rate}%</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-green-50 rounded-lg p-2"><p className="font-bold text-green-700">{totalPresent}</p><p className="text-gray-400">Present</p></div>
                    <div className="bg-red-50 rounded-lg p-2"><p className="font-bold text-red-700">{totalAbsent}</p><p className="text-gray-400">Absent</p></div>
                    <div className="bg-yellow-50 rounded-lg p-2"><p className="font-bold text-yellow-700">{totalLate}</p><p className="text-gray-400">Late</p></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{classSessions.length} sessions recorded</p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Absenteeism Tab */}
        <TabsContent value="absenteeism" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Students ranked by total absences across all recorded sessions.</p>
            <span className="text-xs text-gray-400">{absenteeism.length} students tracked</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Absences</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Late</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Days</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Absence Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {absenteeism.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No attendance data yet.</td></tr>
                ) : absenteeism.map((row, i) => (
                  <tr key={row.studentId} className={`hover:bg-gray-50/50 ${row.absentRate >= 30 ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                          {row.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.className}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${row.absent > 0 ? "text-red-600" : "text-gray-400"}`}>{row.absent}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${row.late > 0 ? "text-yellow-600" : "text-gray-400"}`}>{row.late}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{row.total}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.absentRate >= 30 ? "bg-red-500" : row.absentRate >= 15 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${row.absentRate}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${row.absentRate >= 30 ? "text-red-600" : row.absentRate >= 15 ? "text-yellow-600" : "text-green-600"}`}>
                          {row.absentRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {absenteeism.filter(r => r.absentRate >= 30).length > 0 && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span><strong>{absenteeism.filter(r => r.absentRate >= 30).length} student(s)</strong> have an absence rate of 30% or higher and may require intervention.</span>
            </div>
          )}
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="auditlogs" className="mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Change</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {editLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Badge className={`text-xs capitalize ${log.action === "reopen" ? "bg-orange-100 text-orange-700" : log.action === "lock" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{studentMap[log.student_id] || "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {log.old_status && log.new_status ? (
                        <span className="text-xs">
                          <Badge className={`${statusBadgeClass[log.old_status]} text-[10px] mr-1`}>{log.old_status}</Badge>→
                          <Badge className={`${statusBadgeClass[log.new_status]} text-[10px] ml-1`}>{log.new_status}</Badge>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">{log.reason || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{log.edited_by}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm") : "—"}</td>
                  </tr>
                ))}
                {editLogs.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No edit logs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Session Dialog */}
      <Dialog open={!!viewSession} onOpenChange={v => !v && setViewSession(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attendance Records — {viewSession?.date} · {classMap[viewSession?.class_id]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {viewRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No records found.</p>
            ) : viewRecords.map(rec => (
              <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                    {studentMap[rec.student_id]?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{studentMap[rec.student_id] || "Unknown"}</p>
                    {rec.note && <p className="text-xs text-gray-400">{rec.note}</p>}
                  </div>
                </div>
                <Badge className={`${statusBadgeClass[rec.status]} text-xs capitalize`}>{rec.status}</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reopen Dialog */}
      <Dialog open={!!reopenSession} onOpenChange={v => { if (!v) { setReopenSession(null); setReopenReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Unlock className="w-4 h-4 text-orange-500" /> Reopen Attendance Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-xl p-3 text-sm text-orange-700">
              Reopening session for <strong>{classMap[reopenSession?.class_id]}</strong> on <strong>{reopenSession?.date}</strong>. Reason required.
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason <span className="text-red-500">*</span></label>
              <Textarea value={reopenReason} onChange={e => setReopenReason(e.target.value)} placeholder="Reason for reopening..." className="text-sm min-h-[70px]" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setReopenSession(null); setReopenReason(""); }}>Cancel</Button>
              <Button disabled={!reopenReason.trim()}
                onClick={() => updateSessionStatus.mutate({ id: reopenSession.id, status: "submitted", reason: reopenReason })}
                className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                Reopen Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}