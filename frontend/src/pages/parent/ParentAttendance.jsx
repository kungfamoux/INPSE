import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { statusBadgeClass } from "../components/attendance/StatusChip";

const STATUS_ICON = {
  present: { icon: CheckCircle, color: "text-green-500" },
  absent:  { icon: XCircle,     color: "text-red-500" },
  late:    { icon: Clock,        color: "text-yellow-500" },
  excused: { icon: FileText,     color: "text-blue-500" },
};

export default function ParentAttendance({ currentUser }) {
  const [selectedChild, setSelectedChild] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["my-children", currentUser?.email],
    queryFn: () => base44.entities.Student.filter({ parent_email: currentUser?.email }),
  });
  const { data: students2 = [] } = useQuery({
    queryKey: ["my-children2", currentUser?.email],
    queryFn: () => base44.entities.Student.filter({ parent_email_2: currentUser?.email }),
  });
  const allChildren = [...students, ...students2].filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

  const { data: records = [] } = useQuery({
    queryKey: ["child-att-records", selectedChild],
    queryFn: async () => {
      const sessions = await base44.entities.AttendanceSession.filter({ status: "submitted" });
      if (!sessions.length) return [];
      const recs = await base44.entities.AttendanceRecord.filter({ student_id: selectedChild });
      return recs.map(r => {
        const sess = sessions.find(s => s.id === r.session_id);
        return { ...r, date: sess?.date, class_id: sess?.class_id };
      }).filter(r => r.date).sort((a, b) => b.date?.localeCompare(a.date));
    },
    enabled: !!selectedChild,
  });

  const child = allChildren.find(s => s.id === selectedChild);
  const total = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const late = records.filter(r => r.status === "late").length;
  const excused = records.filter(r => r.status === "excused").length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  // Detect consecutive absences
  const absentDates = records.filter(r => r.status === "absent").map(r => r.date).sort().reverse();
  let consecutiveAbsences = 0;
  for (let i = 0; i < absentDates.length - 1; i++) {
    const diff = differenceInCalendarDays(parseISO(absentDates[i]), parseISO(absentDates[i + 1]));
    if (diff === 1) consecutiveAbsences++;
    else break;
  }
  const showAbsenceAlert = consecutiveAbsences >= 1; // 2+ consecutive absences

  return (
    <div className="space-y-5">
      {/* Child selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Attendance Timeline</h2>
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-full sm:w-64 rounded-xl">
            <SelectValue placeholder="Select a child..." />
          </SelectTrigger>
          <SelectContent>
            {allChildren.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChild && (
        <>
          {/* Absence alert */}
          {showAbsenceAlert && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Consecutive Absence Alert</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {child?.first_name} has been absent for {consecutiveAbsences + 1} consecutive school day(s). Please contact the school if this is unexpected.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-1 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-4 text-white text-center">
              <p className="text-3xl font-bold">{rate}%</p>
              <p className="text-xs mt-1 opacity-90">Attendance Rate</p>
            </div>
            {[
              { label: "Present", count: present, bg: "bg-green-50", text: "text-green-700" },
              { label: "Absent",  count: absent,  bg: "bg-red-50",   text: "text-red-700" },
              { label: "Late",    count: late,    bg: "bg-yellow-50", text: "text-yellow-700" },
              { label: "Excused", count: excused, bg: "bg-blue-50",  text: "text-blue-700" },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${item.text}`}>{item.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Overall Attendance</p>
              <p className="text-sm font-bold text-gray-900">{present + late} / {total} days</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
              {total > 0 && <>
                <div className="bg-green-500 h-full transition-all" style={{ width: `${(present/total)*100}%` }} />
                <div className="bg-yellow-400 h-full transition-all" style={{ width: `${(late/total)*100}%` }} />
                <div className="bg-blue-400 h-full transition-all" style={{ width: `${(excused/total)*100}%` }} />
                <div className="bg-red-400 h-full transition-all" style={{ width: `${(absent/total)*100}%` }} />
              </>}
            </div>
            <div className="flex gap-4 mt-2">
              {[{color:"bg-green-500",label:"Present"},{color:"bg-yellow-400",label:"Late"},{color:"bg-blue-400",label:"Excused"},{color:"bg-red-400",label:"Absent"}].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />{l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Attendance History ({total} records)</p>
            </div>
            {records.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-400">No attendance records yet.</div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {records.map((rec, i) => {
                  const statusCfg = STATUS_ICON[rec.status] || STATUS_ICON.present;
                  const Icon = statusCfg.icon;
                  return (
                    <div key={rec.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${statusCfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {rec.date ? format(parseISO(rec.date), "EEEE, MMMM d, yyyy") : "—"}
                        </p>
                        {rec.note && <p className="text-xs text-gray-400 mt-0.5">{rec.note}</p>}
                      </div>
                      <Badge className={`${statusBadgeClass[rec.status]} text-xs capitalize flex-shrink-0`}>
                        {rec.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {!selectedChild && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Select a child above to view their attendance history.</p>
        </div>
      )}
    </div>
  );
}