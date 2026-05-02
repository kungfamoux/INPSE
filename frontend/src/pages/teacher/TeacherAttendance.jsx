import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, Send, RotateCcw, Users, CheckCircle, XCircle, Lock, AlertTriangle } from "lucide-react";
import StudentRow from "../components/attendance/StudentRow";
import SessionSummaryBar from "../components/attendance/SessionSummaryBar";
import EditReasonDialog from "../components/attendance/EditReasonDialog";

const TODAY = new Date().toISOString().split("T")[0];

export default function TeacherAttendance({ currentUser }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(TODAY);
  const [records, setRecords] = useState({});
  const [pendingEdit, setPendingEdit] = useState(null); // { studentId, newStatus }
  const qc = useQueryClient();

  const { data: staff = [] } = useQuery({
    queryKey: ["my-staff", currentUser?.email],
    queryFn: () => base44.entities.Staff.filter({ user_email: currentUser?.email }),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students-active"], queryFn: () => base44.entities.Student.filter({ status: "active" }) });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });

  const myStaff = staff[0];
  const myClassIds = myStaff?.classes || [];
  const myClasses = classes.filter(c => myClassIds.includes(c.id));
  const classStudents = students.filter(s => s.class_id === selectedClass).sort((a, b) => `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`));
  const currentTerm = terms.find(t => t.is_current);

  // Fetch existing session for this class + date
  const { data: sessions = [] } = useQuery({
    queryKey: ["att-session", selectedClass, date],
    queryFn: () => base44.entities.AttendanceSession.filter({ class_id: selectedClass, date }),
    enabled: !!selectedClass,
  });
  const session = sessions[0] || null;
  const isLocked = session?.status === "locked";
  const isSubmitted = session?.status === "submitted" || isLocked;

  // Fetch records for this session
  const { data: sessionRecords = [] } = useQuery({
    queryKey: ["att-records", session?.id],
    queryFn: () => base44.entities.AttendanceRecord.filter({ session_id: session.id }),
    enabled: !!session?.id,
  });

  // Sync records state from loaded data
  useEffect(() => {
    if (classStudents.length === 0) return;
    const r = {};
    classStudents.forEach(s => {
      const existing = sessionRecords.find(rec => rec.student_id === s.id);
      r[s.id] = existing?.status || "present";
    });
    setRecords(r);
  }, [sessionRecords, selectedClass, students]);

  const handleStatusChange = (studentId, newStatus) => {
    if (isLocked) return;
    if (isSubmitted) {
      const oldStatus = records[studentId];
      if (oldStatus === newStatus) return;
      setPendingEdit({ studentId, newStatus, oldStatus, studentName: (() => { const s = classStudents.find(s => s.id === studentId); return s ? `${s.first_name} ${s.last_name}` : ""; })() });
      return;
    }
    setRecords(prev => ({ ...prev, [studentId]: newStatus }));
  };

  const handleConfirmEdit = async (reason) => {
    const { studentId, newStatus, oldStatus } = pendingEdit;
    setRecords(prev => ({ ...prev, [studentId]: newStatus }));

    // Log the edit
    await base44.entities.AttendanceEditLog.create({
      session_id: session.id,
      student_id: studentId,
      old_status: oldStatus,
      new_status: newStatus,
      reason,
      edited_by: currentUser?.email,
      action: "edit",
    });

    // Update the record
    const rec = sessionRecords.find(r => r.student_id === studentId);
    if (rec) {
      await base44.entities.AttendanceRecord.update(rec.id, {
        status: newStatus,
        note: reason,
        updated_by: currentUser?.email,
        updated_at: new Date().toISOString(),
        edit_reason: reason,
      });
    }
    qc.invalidateQueries(["att-records", session?.id]);
    setPendingEdit(null);
  };

  const saveSession = useMutation({
    mutationFn: async (submitMode) => {
      const counts = { present: 0, absent: 0, late: 0, excused: 0 };
      Object.values(records).forEach(s => { if (counts[s] !== undefined) counts[s]++; });

      let sess = session;
      if (!sess) {
        sess = await base44.entities.AttendanceSession.create({
          date, class_id: selectedClass,
          term_id: currentTerm?.id || "",
          marked_by: currentUser?.email,
          status: submitMode ? "submitted" : "draft",
          submitted_at: submitMode ? new Date().toISOString() : null,
          ...counts,
        });
      } else {
        await base44.entities.AttendanceSession.update(sess.id, {
          status: submitMode ? "submitted" : sess.status === "draft" ? "draft" : sess.status,
          submitted_at: submitMode ? new Date().toISOString() : sess.submitted_at,
          ...counts,
        });
      }

      // Upsert records
      for (const student of classStudents) {
        const existing = sessionRecords.find(r => r.student_id === student.id);
        const data = { session_id: sess.id, student_id: student.id, status: records[student.id] || "present", updated_by: currentUser?.email, updated_at: new Date().toISOString() };
        if (existing) await base44.entities.AttendanceRecord.update(existing.id, data);
        else await base44.entities.AttendanceRecord.create(data);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(["att-session", selectedClass, date]);
      qc.invalidateQueries(["att-records", session?.id]);
    },
  });

  const markAll = (status) => {
    const r = {};
    classStudents.forEach(s => { r[s.id] = status; });
    setRecords(r);
  };

  const sessionStatusColor = { draft: "bg-yellow-100 text-yellow-700", submitted: "bg-green-100 text-green-700", locked: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Mark Attendance</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setRecords({}); }}>
            <SelectTrigger className="rounded-xl flex-1">
              <SelectValue placeholder="Select your class..." />
            </SelectTrigger>
            <SelectContent>
              {myClasses.length === 0 && <SelectItem value="none" disabled>No classes assigned</SelectItem>}
              {myClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl w-full sm:w-44" max={TODAY} />
        </div>

        {/* Session status badge */}
        {session && (
          <div className="flex items-center gap-2 mt-3">
            <Badge className={`${sessionStatusColor[session.status]} text-xs`}>
              {session.status === "locked" ? "🔒 Locked" : session.status === "submitted" ? "✓ Submitted" : "Draft"}
            </Badge>
            {session.submitted_at && (
              <span className="text-xs text-gray-400">Submitted {new Date(session.submitted_at).toLocaleString()}</span>
            )}
            {isLocked && (
              <span className="text-xs text-red-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin/Proprietor can reopen</span>
            )}
          </div>
        )}
      </div>

      {/* No classes warning */}
      {myClasses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 text-sm text-yellow-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          No classes assigned to your staff record. Ask an Admin to assign your classes.
        </div>
      )}

      {selectedClass && classStudents.length > 0 && (
        <>
          {/* Summary bar */}
          <SessionSummaryBar records={records} />

          {/* Speed actions */}
          {!isLocked && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => markAll("present")} className="gap-2 rounded-xl border-green-200 text-green-700 hover:bg-green-50">
                <CheckCircle className="w-4 h-4" /> Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll("absent")} className="gap-2 rounded-xl border-red-200 text-red-700 hover:bg-red-50">
                <XCircle className="w-4 h-4" /> Mark All Absent
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll("present")} className="gap-2 rounded-xl text-gray-500">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              <span className="ml-auto text-xs text-gray-400 self-center">{classStudents.length} students</span>
            </div>
          )}

          {/* Roster */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pr-1">Status</span>
            </div>
            <div className="divide-y divide-gray-100">
              {classStudents.map((student, i) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  status={records[student.id] || "present"}
                  onStatusChange={(status) => handleStatusChange(student.id, status)}
                  disabled={isLocked}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {!isLocked && (
            <div className="flex gap-3 pb-6">
              <Button variant="outline" onClick={() => saveSession.mutate(false)} disabled={saveSession.isPending} className="gap-2 rounded-xl flex-1 sm:flex-none">
                <Save className="w-4 h-4" /> Save Draft
              </Button>
              <Button onClick={() => saveSession.mutate(true)} disabled={saveSession.isPending}
                className="gap-2 rounded-xl flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white hover:opacity-90">
                <Send className="w-4 h-4" /> {saveSession.isPending ? "Submitting..." : "Submit Attendance"}
              </Button>
            </div>
          )}
        </>
      )}

      {selectedClass && classStudents.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No active students in this class.</p>
        </div>
      )}

      {/* Edit reason dialog */}
      <EditReasonDialog
        open={!!pendingEdit}
        onClose={() => setPendingEdit(null)}
        onConfirm={handleConfirmEdit}
        studentName={pendingEdit?.studentName}
        oldStatus={pendingEdit?.oldStatus}
        newStatus={pendingEdit?.newStatus}
      />
    </div>
  );
}