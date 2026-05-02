import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReportCardButton from "../components/results/ReportCardButton";

export default function ParentResults({ currentUser }) {
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("all");

  const { data: students = [] } = useQuery({ queryKey: ["my-children"], queryFn: () => base44.entities.Student.filter({ parent_email: currentUser?.email }) });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => base44.entities.Subject.list() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => base44.entities.Term.list() });
  const { data: assessments = [] } = useQuery({
    queryKey: ["child-results", selectedChild],
    queryFn: () => base44.entities.Assessment.filter({ student_id: selectedChild }),
    enabled: !!selectedChild,
  });

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));
  const termMap = Object.fromEntries(terms.map(t => [t.id, t.name]));
  const filtered = selectedTerm === "all" ? assessments : assessments.filter(a => a.term_id === selectedTerm);

  const gradeColors = { A: "bg-green-100 text-green-700", B: "bg-blue-100 text-blue-700", C: "bg-yellow-100 text-yellow-700", D: "bg-orange-100 text-orange-700", E: "bg-red-100 text-red-700", F: "bg-red-200 text-red-800" };

  const columns = [
    { key: "subject", label: "Subject", render: r => <span className="font-medium">{subjectMap[r.subject_id] || r.subject_id}</span> },
    { key: "term", label: "Term", render: r => termMap[r.term_id] || r.term_id },
    { key: "ca1", label: "CA1", render: r => r.ca1 ?? "—" },
    { key: "ca2", label: "CA2", render: r => r.ca2 ?? "—" },
    { key: "exam", label: "Exam", render: r => r.exam ?? "—" },
    { key: "total", label: "Total", render: r => <span className="font-bold">{r.total ?? "—"}</span> },
    { key: "grade", label: "Grade", render: r => r.grade ? <Badge className={`text-xs ${gradeColors[r.grade] || "bg-gray-100 text-gray-700"}`}>{r.grade}</Badge> : "—" },
    { key: "remark", label: "Remark" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-56 rounded-xl"><SelectValue placeholder="Select child" /></SelectTrigger>
            <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="Filter term" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Terms</SelectItem>{terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {selectedChild && selectedTerm !== "all" && (
          <ReportCardButton
            studentId={selectedChild}
            termId={selectedTerm}
            variant="default"
            size="default"
          />
        )}
      </div>

      {selectedChild ? (
        <DataTable columns={columns} data={filtered} emptyMessage="No results available for this child yet." />
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">Select a child to view their results.</p></div>
      )}
    </div>
  );
}