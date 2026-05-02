import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function StudentAttendance({ currentUser }) {
  const { data: students = [] } = useQuery({ queryKey: ["my-student"], queryFn: () => base44.entities.Student.filter({ user_email: currentUser?.email }) });
  const myStudent = students[0];

  const { data: attendance = [] } = useQuery({
    queryKey: ["my-attendance", myStudent?.id],
    queryFn: () => base44.entities.Attendance.filter({ student_id: myStudent?.id }, "-date", 200),
    enabled: !!myStudent?.id,
  });

  const statusColors = { present: "bg-green-100 text-green-700", absent: "bg-red-100 text-red-700", late: "bg-yellow-100 text-yellow-700", excused: "bg-blue-100 text-blue-700" };
  const present = attendance.filter(a => a.status === "present").length;
  const total = attendance.length;

  const columns = [
    { key: "date", label: "Date", render: r => r.date ? format(new Date(r.date), "MMM d, yyyy") : "—" },
    { key: "status", label: "Status", render: r => <Badge className={`text-xs capitalize ${statusColors[r.status]}`}>{r.status}</Badge> },
    { key: "note", label: "Note", render: r => r.note || "—" },
  ];

  if (!myStudent) return <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No student record linked.</p></div>;

  return (
    <div className="space-y-6">
      {total > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Attendance Rate: <span className="font-bold text-gray-900">{Math.round((present / total) * 100)}%</span> ({present}/{total} days present)</p>
        </div>
      )}
      <DataTable columns={columns} data={attendance} emptyMessage="No attendance records yet." />
    </div>
  );
}