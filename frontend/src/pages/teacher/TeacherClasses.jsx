import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { School } from "lucide-react";

export default function TeacherClasses({ currentUser }) {
  const { data: staff = [] } = useQuery({ queryKey: ["my-staff"], queryFn: () => base44.entities.Staff.filter({ user_email: currentUser?.email }) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.filter({ status: "active" }) });

  const myStaff = staff[0];
  const myClassIds = myStaff?.classes || [];
  const myClasses = classes.filter(c => myClassIds.includes(c.id));

  const columns = [
    { key: "name", label: "Class", render: r => <div className="flex items-center gap-2"><School className="w-4 h-4 text-orange-500" /><span className="font-medium">{r.name} {r.arm || ""}</span></div> },
    { key: "level", label: "Level", render: r => <span className="capitalize">{r.level?.replace("_", " ")}</span> },
    { key: "students", label: "Students", render: r => students.filter(s => s.class_id === r.id).length },
    { key: "capacity", label: "Capacity", render: r => r.capacity || "—" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm">{myClasses.length} assigned classes</p>
      <DataTable columns={columns} data={myClasses} emptyMessage="No classes assigned to you yet." />
    </div>
  );
}