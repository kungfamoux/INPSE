import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReportCardButton from "../components/results/ReportCardButton";

export default function StudentResults({ currentUser }) {
  const [termFilter, setTermFilter] = useState("all");

  const { data: students = [] } = useQuery({ queryKey: ["my-student"], queryFn: () => base44.entities.Student.filter({ user_email: currentUser?.email }) });
  const myStudent = students[0];

  const { data: assessments = [] } = useQuery({
    queryKey: ["my-assessments", myStudent?.id],
    queryFn: () => base44.entities.Assessment.filter({ student_id: myStudent?.id }),
    enabled: !!myStudent?.id,
  });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => base44.entities.Subject.list() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));
  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));
  const filtered = termFilter === "all" ? assessments : assessments.filter(a => a.term_id === termFilter);

  const gradeColors = { A: "bg-green-100 text-green-700", B: "bg-blue-100 text-blue-700", C: "bg-yellow-100 text-yellow-700", D: "bg-orange-100 text-orange-700", E: "bg-red-100 text-red-700", F: "bg-red-200 text-red-800" };

  const columns = [
    { key: "subject", label: "Subject", render: r => <span className="font-medium">{subjectMap[r.subject_id] || r.subject_id}</span> },
    { key: "term", label: "Term", render: r => termMap[r.term_id] || r.term_id },
    { key: "ca1", label: "CA1" },
    { key: "ca2", label: "CA2" },
    { key: "exam", label: "Exam" },
    { key: "total", label: "Total", render: r => <span className="font-bold">{r.total}</span> },
    { key: "grade", label: "Grade", render: r => <Badge className={`text-xs ${gradeColors[r.grade] || "bg-gray-100"}`}>{r.grade}</Badge> },
    { key: "remark", label: "Remark" },
  ];

  if (!myStudent) return <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No student record linked to your account.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="All Terms" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Terms</SelectItem>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
        {myStudent && termFilter !== "all" && (
          <ReportCardButton
            studentId={myStudent.id}
            termId={termFilter}
            variant="default"
            size="default"
          />
        )}
      </div>
      <DataTable columns={columns} data={filtered} emptyMessage="No results available yet." />
    </div>
  );
}