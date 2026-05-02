import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Badge } from "@/components/ui/badge";

export default function AdminParents() {
  const { data: students = [], isLoading } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.list("-created_date", 500) });

  // Group students by parent email
  const parentMap = {};
  students.forEach(s => {
    if (s.parent_email) {
      if (!parentMap[s.parent_email]) parentMap[s.parent_email] = [];
      parentMap[s.parent_email].push(s);
    }
    if (s.parent_email_2) {
      if (!parentMap[s.parent_email_2]) parentMap[s.parent_email_2] = [];
      parentMap[s.parent_email_2].push(s);
    }
  });

  const parents = Object.entries(parentMap).map(([email, kids]) => ({
    id: email,
    email,
    children: kids,
    childrenNames: kids.map(k => `${k.first_name} ${k.last_name}`).join(", "),
    count: kids.length,
  }));

  const columns = [
    { key: "email", label: "Parent Email", render: r => <span className="font-medium">{r.email}</span> },
    { key: "childrenNames", label: "Linked Students", render: r => <span className="text-sm">{r.childrenNames}</span> },
    { key: "count", label: "Children", render: r => <Badge className="bg-blue-100 text-blue-700 text-xs">{r.count}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm">{parents.length} parents linked via student records</p>
      <DataTable columns={columns} data={parents} isLoading={isLoading} emptyMessage="No parents linked yet. Add parent emails on student records." />
    </div>
  );
}