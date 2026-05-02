import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

export default function ParentChildren({ currentUser }) {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["my-children"],
    queryFn: () => base44.entities.Student.filter({ parent_email: currentUser?.email }),
  });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`]));

  if (isLoading) return <div className="animate-pulse space-y-4">{[1,2].map(i => <div key={i} className="h-28 bg-white rounded-2xl" />)}</div>;

  return (
    <div className="space-y-4">
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-gray-400">No children linked to your account yet.</p>
        </div>
      ) : (
        students.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {s.first_name?.[0]}{s.last_name?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{s.first_name} {s.last_name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{classMap[s.class_id] || "No class"}</Badge>
                  <Badge className={`text-xs ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</Badge>
                  {s.admission_no && <Badge variant="outline" className="text-xs">Adm: {s.admission_no}</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-500">
                  <p>DOB: {s.date_of_birth || "—"}</p>
                  <p>Gender: <span className="capitalize">{s.gender || "—"}</span></p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}