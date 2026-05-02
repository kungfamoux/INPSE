import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "../components/portal/StatCard";
import { BarChart3, ClipboardList, CreditCard, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard({ currentUser }) {
  const { data: students = [] } = useQuery({
    queryKey: ["my-student"],
    queryFn: () => base44.entities.Student.filter({ user_email: currentUser?.email }),
  });
  const myStudent = students[0];

  const { data: assessments = [] } = useQuery({
    queryKey: ["my-assessments", myStudent?.id],
    queryFn: () => base44.entities.Assessment.filter({ student_id: myStudent?.id }),
    enabled: !!myStudent?.id,
  });
  const { data: attendance = [] } = useQuery({
    queryKey: ["my-attendance", myStudent?.id],
    queryFn: () => base44.entities.Attendance.filter({ student_id: myStudent?.id }, "-date", 100),
    enabled: !!myStudent?.id,
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["my-invoices", myStudent?.id],
    queryFn: () => base44.entities.FeeInvoice.filter({ student_id: myStudent?.id }),
    enabled: !!myStudent?.id,
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.filter({ is_published: true }, "-created_date", 5),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });

  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`]));
  const presentDays = attendance.filter(a => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;
  const avgScore = assessments.length > 0 ? Math.round(assessments.reduce((s, a) => s + (a.total || 0), 0) / assessments.length) : 0;
  const balance = invoices.reduce((s, i) => s + ((i.total || 0) - (i.paid || 0)), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.full_name?.split(" ")[0] || "Student"} 👋</h2>
        {myStudent && <p className="text-gray-500 text-sm mt-1">Class: {classMap[myStudent.class_id] || "—"} · Adm No: {myStudent.admission_no || "—"}</p>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Score" value={`${avgScore}%`} icon={BarChart3} color="orange" />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={ClipboardList} color="blue" />
        <StatCard title="Fee Balance" value={`₦${balance.toLocaleString()}`} icon={CreditCard} color={balance > 0 ? "red" : "green"} />
        <StatCard title="Subjects" value={new Set(assessments.map(a => a.subject_id)).size} icon={Megaphone} color="purple" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Announcements</h3>
        <div className="space-y-2">
          {announcements.filter(a => a.audience === "all" || a.audience === "students").map(a => (
            <div key={a.id} className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{a.title}</span>
                <Badge className={`text-xs ${a.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{a.priority}</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.body}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-sm text-gray-400">No announcements</p>}
        </div>
      </div>
    </div>
  );
}