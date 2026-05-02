import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminResults() {
  const [classFilter, setClassFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");

  const { data: assessments = [], isLoading } = useQuery({ queryKey: ["assessments"], queryFn: () => base44.entities.Assessment.list("-created_date", 1000) });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.list() });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => base44.entities.Subject.list() });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });

  const studentMap = Object.fromEntries(students.map(s => [s.id, { name: `${s.first_name} ${s.last_name}`, class_id: s.class_id }]));
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));
  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`]));
  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));

  const filtered = assessments.filter(a => {
    if (classFilter !== "all" && a.class_id !== classFilter) return false;
    if (termFilter !== "all" && a.term_id !== termFilter) return false;
    return true;
  });

  const columns = [
    { key: "student", label: "Student", render: r => <span className="font-medium">{studentMap[r.student_id]?.name || r.student_id}</span> },
    { key: "subject", label: "Subject", render: r => subjectMap[r.subject_id] || r.subject_id },
    { key: "class", label: "Class", render: r => classMap[r.class_id] || "—" },
    { key: "term", label: "Term", render: r => termMap[r.term_id] || r.term_id },
    { key: "ca1", label: "CA1", render: r => r.ca1 ?? "—" },
    { key: "ca2", label: "CA2", render: r => r.ca2 ?? "—" },
    { key: "exam", label: "Exam", render: r => r.exam ?? "—" },
    { key: "total", label: "Total", render: r => <span className="font-bold">{r.total ?? "—"}</span> },
    { key: "grade", label: "Grade", render: r => r.grade ? <Badge className="bg-gray-100 text-gray-700 text-xs">{r.grade}</Badge> : "—" },
    { key: "remark", label: "Remark", render: r => r.remark || "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="Filter by class" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.arm || ""}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="Filter by term" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Terms</SelectItem>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No results entered yet" />
    </div>
  );
}